import { HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';

const GITHUB_API = 'https://api.github.com';

@Injectable()
export class GithubClient {
  constructor(private readonly prisma: PrismaService) {}

  private async getAccessToken(userId: string): Promise<string> {
    const account = await this.prisma.account.findFirst({ where: { userId, provider: 'github' } });
    if (!account?.access_token) {
      throw new UnauthorizedException('GitHub account not connected');
    }
    return account.access_token;
  }

  private async request(userId: string, path: string) {
    return this.requestWithPayload(userId, path, 'GET');
  }

  private async requestWithPayload(userId: string, path: string, method: 'GET' | 'POST' | 'PUT' | 'PATCH' = 'GET', body?: any) {
    let token: string | null = null;
    try {
      token = await this.getAccessToken(userId);
    } catch {
      // Optional token for public GitHub read endpoints
    }

    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'Codentra-App',
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options: RequestInit = {
      method,
      headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    let response = await fetch(`${GITHUB_API}${path}`, options);

    // If authenticated request failed with 401 token invalid/expired on GET, retry without token for public endpoints
    if (response.status === 401 && token && method === 'GET') {
      delete headers['Authorization'];
      response = await fetch(`${GITHUB_API}${path}`, { method: 'GET', headers });
    }

    if (!response.ok) {
      if (response.status === 404) {
        throw new NotFoundException(`Resource not found on GitHub (${path})`);
      }
      if (response.status === 403 || response.status === 429) {
        throw new HttpException('GitHub API rate limit exceeded or access forbidden', HttpStatus.TOO_MANY_REQUESTS);
      }
      if (response.status === 401) {
        throw new UnauthorizedException('GitHub authentication token invalid or expired');
      }
      const errorText = await response.text();
      throw new HttpException(`GitHub API error (${response.status}): ${errorText}`, response.status);
    }

    return response.json();
  }

  getProfile(userId: string) {
    return this.request(userId, '/user');
  }

  listRepositories(userId: string) {
    return this.request(userId, '/user/repos?per_page=100&sort=updated');
  }

  getRepository(userId: string, owner: string, repo: string) {
    return this.request(userId, `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`);
  }

  searchUsers(userId: string, query: string, page = 1, perPage = 20) {
    return this.request(
      userId,
      `/search/users?q=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`,
    );
  }

  getUserProfile(userId: string, username: string) {
    return this.request(userId, `/users/${encodeURIComponent(username)}`);
  }

  getUserRepositories(userId: string, username: string, page = 1, perPage = 30, sort = 'updated') {
    return this.request(
      userId,
      `/users/${encodeURIComponent(username)}/repos?sort=${sort}&page=${page}&per_page=${perPage}`,
    );
  }

  getBranches(userId: string, owner: string, repo: string) {
    return this.request(userId, `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/branches?per_page=100`);
  }

  getTree(userId: string, owner: string, repo: string, branch: string, recursive = true) {
    return this.request(
      userId,
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/${encodeURIComponent(branch)}${
        recursive ? '?recursive=1' : ''
      }`,
    );
  }

  getFileContent(userId: string, owner: string, repo: string, path: string, ref: string) {
    const encodedPath = path
      .split('/')
      .map(p => encodeURIComponent(p))
      .join('/');
    return this.request(
      userId,
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodedPath}?ref=${encodeURIComponent(ref)}`,
    );
  }

  /** Returns a tarball download URL and the token to authorize it with —
   * the worker streams this directly rather than the API server buffering
   * a potentially large archive. Token is passed via header, never embedded
   * in the URL (URLs end up in logs). */
  async getTarballDownload(userId: string, owner: string, repo: string, ref: string): Promise<{ url: string; token: string }> {
    const token = await this.getAccessToken(userId);
    return { url: `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/tarball/${ref}`, token };
  }

  listPullRequestFiles(userId: string, owner: string, repo: string, prNumber: number) {
    return this.request(userId, `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls/${prNumber}/files`);
  }

  getBranch(userId: string, owner: string, repo: string, branch: string) {
    return this.request(userId, `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/branches/${encodeURIComponent(branch)}`);
  }

  updateFile(
    userId: string,
    owner: string,
    repo: string,
    path: string,
    message: string,
    contentBase64: string,
    branch: string,
    sha?: string,
  ) {
    const encodedPath = path
      .split('/')
      .map((p) => encodeURIComponent(p))
      .join('/');

    const payload: any = {
      message,
      content: contentBase64,
      branch,
    };
    if (sha) payload.sha = sha;

    return this.requestWithPayload(
      userId,
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodedPath}`,
      'PUT',
      payload,
    );
  }

  createBranch(userId: string, owner: string, repo: string, newBranchName: string, fromSha: string) {
    return this.requestWithPayload(
      userId,
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/refs`,
      'POST',
      {
        ref: `refs/heads/${newBranchName}`,
        sha: fromSha,
      },
    );
  }

  forkRepository(userId: string, owner: string, repo: string) {
    return this.requestWithPayload(
      userId,
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/forks`,
      'POST',
      {},
    );
  }

  createPullRequest(
    userId: string,
    owner: string,
    repo: string,
    title: string,
    body: string,
    head: string,
    base: string,
  ) {
    return this.requestWithPayload(
      userId,
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls`,
      'POST',
      {
        title,
        body,
        head,
        base,
      },
    );
  }
}
