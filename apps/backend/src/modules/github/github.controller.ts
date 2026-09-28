import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { SessionGuard } from '@/modules/auth/guards/session.guard';

import { CheckPermissionQueryDto, SubmitContributionDto } from './dto/contribution.dto';
import { GetFileContentDto } from './dto/get-file-content.dto';
import { GetRepoTreeDto } from './dto/get-repo-tree.dto';
import { ImportGithubRepoDto } from './dto/import-repo.dto';
import { ListUserReposDto } from './dto/list-user-repos.dto';
import { SearchUsersDto } from './dto/search-users.dto';
import { GithubService } from './github.service';

@Controller('github')
@UseGuards(SessionGuard)
export class GithubController {
  constructor(private readonly github: GithubService) {}

  @Get('repositories')
  listRepositories(@CurrentUser() user: User) {
    return this.github.listUserRepositories(user.id);
  }

  @Post('import')
  import(@CurrentUser() user: User, @Body() dto: ImportGithubRepoDto) {
    return this.github.importRepository(user.id, dto.projectId, dto.owner, dto.repo);
  }

  @Post('repositories/:repositoryId/sync')
  sync(@CurrentUser() user: User, @Param('repositoryId') repositoryId: string) {
    return this.github.syncRepository(user.id, repositoryId);
  }

  @Get('users/search')
  searchUsers(@CurrentUser() user: User, @Query() dto: SearchUsersDto) {
    return this.github.searchUsers(user.id, dto.q, dto.page, dto.per_page);
  }

  @Get('users/:username')
  getUserProfile(@CurrentUser() user: User, @Param('username') username: string) {
    return this.github.getUserProfile(user.id, username);
  }

  @Get('users/:username/repos')
  getUserRepositories(
    @CurrentUser() user: User,
    @Param('username') username: string,
    @Query() dto: ListUserReposDto,
  ) {
    return this.github.getUserRepositories(user.id, username, dto.page, dto.per_page, dto.sort);
  }

  @Get('repos/:owner/:repo/branches')
  getBranches(@CurrentUser() user: User, @Param('owner') owner: string, @Param('repo') repo: string) {
    return this.github.getRepoBranches(user.id, owner, repo);
  }

  @Get('repos/:owner/:repo/tree')
  getTree(
    @CurrentUser() user: User,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Query() dto: GetRepoTreeDto,
  ) {
    return this.github.getRepoTree(user.id, owner, repo, dto.branch, dto.recursive);
  }

  @Get('repos/:owner/:repo/contents')
  getFileContent(
    @CurrentUser() user: User,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Query() dto: GetFileContentDto,
  ) {
    return this.github.getFileContent(user.id, owner, repo, dto.path, dto.ref);
  }

  @Get('repos/:owner/:repo/permissions')
  checkPermissions(
    @CurrentUser() user: User,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Query('branch') branch: string,
  ) {
    return this.github.checkContributionPermissions(user.id, { owner, repo, branch: branch || 'main' });
  }

  @Post('contribution/submit')
  submitContribution(@CurrentUser() user: User, @Body() dto: SubmitContributionDto) {
    return this.github.submitContribution(user.id, dto);
  }
}
