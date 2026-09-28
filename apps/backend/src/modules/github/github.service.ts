import { Injectable } from '@nestjs/common';

import {
  CheckPermissionQueryDto,
  ContributionSubmissionResult,
  PermissionCheckResult,
  SubmitContributionDto,
} from './dto/contribution.dto';
import { GithubClient } from './github-client';

import { PrismaService } from '@/common/prisma/prisma.service';
import { QueueService } from '@/common/queue/queue.service';
import { ProjectsService } from '@/modules/projects/projects.service';


interface GithubRepoMetadata {
  name: string;
  html_url: string;
  default_branch: string;
}

@Injectable()
export class GithubService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projects: ProjectsService,
    private readonly github: GithubClient,
    private readonly queue: QueueService,
  ) {}

  async checkContributionPermissions(userId: string, dto: CheckPermissionQueryDto): Promise<PermissionCheckResult> {
    const { owner, repo, branch } = dto;

    const [repoData, userProfile] = await Promise.all([
      this.github.getRepository(userId, owner, repo) as Promise<any>,
      this.github.getProfile(userId) as Promise<any>,
    ]);

    let isBranchProtected = false;
    try {
      const branchData = (await this.github.getBranch(userId, owner, repo, branch)) as any;
      isBranchProtected = Boolean(branchData?.protected);
    } catch (e) {
      // Ignore if branch info check fails
    }

    const hasWriteAccess = Boolean(repoData?.permissions?.push);
    const authenticatedUser = userProfile.login;

    let suggestedWorkflow: 'DIRECT_COMMIT' | 'NEW_BRANCH_PR' | 'FORK_PR' = 'FORK_PR';
    if (hasWriteAccess) {
      suggestedWorkflow = isBranchProtected ? 'NEW_BRANCH_PR' : 'DIRECT_COMMIT';
    }

    return {
      owner,
      repo,
      branch,
      authenticatedUser,
      hasWriteAccess,
      isBranchProtected,
      suggestedWorkflow,
    };
  }

  async submitContribution(userId: string, dto: SubmitContributionDto): Promise<ContributionSubmissionResult> {
    const { owner, repo, baseBranch, commitMessage, prTitle, prBody, changes } = dto;

    const permCheck = await this.checkContributionPermissions(userId, { owner, repo, branch: baseBranch });

    // Workflow 1: Direct Commit if user has write access and branch is not protected
    if (permCheck.hasWriteAccess && !permCheck.isBranchProtected) {
      for (const change of changes) {
        const contentBase64 = Buffer.from(change.content).toString('base64');
        await this.github.updateFile(
          userId,
          owner,
          repo,
          change.path,
          commitMessage,
          contentBase64,
          baseBranch,
          change.sha,
        );
      }

      return {
        success: true,
        workflow: 'DIRECT_COMMIT',
        message: `Successfully committed ${changes.length} change(s) directly to branch '${baseBranch}'.`,
      };
    }

    // Workflow 2: Fork + Pull Request
    // Step 1: Fork repository to user's account
    const forkData = (await this.github.forkRepository(userId, owner, repo)) as any;
    const forkOwner = forkData.owner?.login || permCheck.authenticatedUser;

    // Step 2: Get base branch commit SHA
    const baseBranchInfo = (await this.github.getBranch(userId, owner, repo, baseBranch)) as any;
    const fromSha = baseBranchInfo.commit.sha;

    // Step 3: Create patch branch on fork
    const newBranchName = `codentra-patch-${Date.now().toString().slice(-6)}`;
    try {
      await this.github.createBranch(userId, forkOwner, repo, newBranchName, fromSha);
    } catch (e) {
      // Retry or ignore if branch exists
    }

    // Step 4: Commit changed files to the patch branch on fork
    for (const change of changes) {
      const contentBase64 = Buffer.from(change.content).toString('base64');
      await this.github.updateFile(
        userId,
        forkOwner,
        repo,
        change.path,
        commitMessage,
        contentBase64,
        newBranchName,
        change.sha,
      );
    }

    // Step 5: Create Pull Request from fork to upstream
    const title = prTitle || commitMessage || 'Code Contribution via Codentra';
    const body = prBody || 'Submitted automatically via Codentra Browser IDE AI Assistant.';
    const headRef = `${forkOwner}:${newBranchName}`;

    const prData = (await this.github.createPullRequest(
      userId,
      owner,
      repo,
      title,
      body,
      headRef,
      baseBranch,
    )) as any;

    return {
      success: true,
      workflow: 'FORK_PR',
      prUrl: prData.html_url,
      prNumber: prData.number,
      forkRepo: `${forkOwner}/${repo}`,
      branchName: newBranchName,
      message: `Pull Request #${prData.number} created successfully from ${forkOwner}:${newBranchName}!`,
    };
  }

  async listUserRepositories(userId: string) {
    return this.github.listRepositories(userId);
  }

  async importRepository(userId: string, projectId: string, owner: string, repoName: string) {
    await this.projects.findOne(userId, projectId); // asserts access

    const metadata = (await this.github.getRepository(userId, owner, repoName)) as GithubRepoMetadata;

    const repository = await this.prisma.repository.create({
      data: {
        projectId,
        name: metadata.name,
        type: 'GITHUB',
        githubUrl: metadata.html_url,
        githubOwner: owner,
        githubRepo: repoName,
        connectedByUserId: userId,
        defaultBranch: metadata.default_branch,
        status: 'PENDING',
      },
    });

    await this.syncRepository(userId, repository.id);
    return repository;
  }

  async syncRepository(callerUserId: string | null, repositoryId: string) {
    const repository = await this.prisma.repository.findUniqueOrThrow({ where: { id: repositoryId } });
    if (repository.type !== 'GITHUB' || !repository.githubOwner || !repository.githubRepo) {
      throw new Error('Repository is not GitHub-connected');
    }

    // Manual sync uses the requesting user's token; webhook-triggered sync
    // (callerUserId === null) uses whoever originally connected the repo.
    const userId = callerUserId ?? repository.connectedByUserId;
    if (!userId) throw new Error('No GitHub-connected user available to authorize this sync');

    const { url, token } = await this.github.getTarballDownload(
      userId,
      repository.githubOwner,
      repository.githubRepo,
      repository.defaultBranch ?? 'main',
    );

    const upload = await this.prisma.upload.create({
      data: { repositoryId, fileName: `${repository.githubRepo}.tar.gz`, sizeBytes: 0, status: 'PROCESSING' },
    });

    await this.prisma.repository.update({ where: { id: repositoryId }, data: { status: 'PROCESSING' } });

    await this.queue.enqueueRepositoryProcessing({
      repositoryId,
      uploadId: upload.id,
      archiveType: 'github',
      github: { url, token },
    });

    return { success: true };
  }

  async searchUsers(userId: string, query: string, page = 1, perPage = 20) {
    return this.github.searchUsers(userId, query, page, perPage);
  }

  async getUserProfile(userId: string, username: string) {
    return this.github.getUserProfile(userId, username);
  }

  async getUserRepositories(userId: string, username: string, page = 1, perPage = 30, sort = 'updated') {
    return this.github.getUserRepositories(userId, username, page, perPage, sort);
  }

  async getRepoBranches(userId: string, owner: string, repo: string) {
    return this.github.getBranches(userId, owner, repo);
  }

  async getRepoTree(userId: string, owner: string, repo: string, branch: string, recursive = true) {
    return this.github.getTree(userId, owner, repo, branch, recursive);
  }

  async getFileContent(userId: string, owner: string, repo: string, path: string, ref: string) {
    return this.github.getFileContent(userId, owner, repo, path, ref);
  }
}
