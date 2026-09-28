import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { PaginationQueryDto } from '@/common/pagination/pagination.dto';
import { SessionGuard } from '@/modules/auth/guards/session.guard';

import { AnalysisService } from './analysis.service';
import { UpdateFindingStatusDto } from './dto/finding.dto';

@Controller()
@UseGuards(SessionGuard)
export class AnalysisController {
  constructor(private readonly analysis: AnalysisService) {}

  @Post('repositories/:repositoryId/analyze')
  trigger(@CurrentUser() user: User, @Param('repositoryId') repositoryId: string) {
    return this.analysis.triggerAnalysis(user.id, repositoryId);
  }

  @Get('reviews')
  listAllMine(@CurrentUser() user: User) {
    return this.analysis.listAllForUser(user.id);
  }

  @Get('reviews/stats')
  getDashboardStats(@CurrentUser() user: User) {
    return this.analysis.getDashboardStats(user.id);
  }

  @Get('repositories/:repositoryId/analyses')
  list(@CurrentUser() user: User, @Param('repositoryId') repositoryId: string) {
    return this.analysis.listAnalysesForRepository(user.id, repositoryId);
  }

  @Get('analyses/:analysisId')
  getOne(@CurrentUser() user: User, @Param('analysisId') analysisId: string) {
    return this.analysis.getAnalysis(user.id, analysisId);
  }

  @Get('analyses/:analysisId/findings')
  getFindingsPage(@CurrentUser() user: User, @Param('analysisId') analysisId: string, @Query() query: PaginationQueryDto) {
    return this.analysis.getFindingsPage(user.id, analysisId, query);
  }

  @Patch('findings/:findingId')
  updateStatus(@CurrentUser() user: User, @Param('findingId') findingId: string, @Body() dto: UpdateFindingStatusDto) {
    return this.analysis.updateFindingStatus(user.id, findingId, dto.status);
  }
}
