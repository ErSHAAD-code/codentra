import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ArtifactType, User } from '@prisma/client';
import { IsString } from 'class-validator';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { SessionGuard } from '@/modules/auth/guards/session.guard';

import { AiProductivityService } from './ai-productivity.service';
import {
  CommitMessageDto,
  DebugCodeDto,
  ExplainFileDto,
  GenerateTestsDto,
  RefactorFileDto,
  SqlExplainDto,
} from './dto/ai-productivity.dto';
import { EditorAiPromptDto } from './dto/editor-ai.dto';
import { EditorReviewRequestDto } from './dto/editor-review.dto';

class ExplainAlgorithmDto {
  @IsString()
  code!: string;
}

@Controller('repositories/:repositoryId/ai')
@UseGuards(SessionGuard)
export class AiProductivityController {
  constructor(private readonly ai: AiProductivityService) {}

  @Post('readme')
  generateReadme(@CurrentUser() user: User, @Param('repositoryId') repositoryId: string) {
    return this.ai.generateReadme(user.id, repositoryId);
  }

  @Post('tests')
  generateTests(@CurrentUser() user: User, @Param('repositoryId') repositoryId: string, @Body() dto: GenerateTestsDto) {
    return this.ai.generateTests(user.id, repositoryId, dto.fileId, dto.framework);
  }

  @Post('explain')
  explainCode(@CurrentUser() user: User, @Param('repositoryId') repositoryId: string, @Body() dto: ExplainFileDto) {
    return this.ai.explainCode(user.id, repositoryId, dto.fileId);
  }

  @Post('explain-architecture')
  explainArchitecture(@CurrentUser() user: User, @Param('repositoryId') repositoryId: string) {
    return this.ai.explainArchitecture(user.id, repositoryId);
  }

  @Post('refactor')
  refactor(@CurrentUser() user: User, @Param('repositoryId') repositoryId: string, @Body() dto: RefactorFileDto) {
    return this.ai.refactorFile(user.id, repositoryId, dto.fileId);
  }

  @Post('diagram')
  generateDiagram(@CurrentUser() user: User, @Param('repositoryId') repositoryId: string) {
    return this.ai.generateDiagram(user.id, repositoryId);
  }

  @Get('artifacts')
  listArtifacts(
    @CurrentUser() user: User,
    @Param('repositoryId') repositoryId: string,
    @Query('type') type?: ArtifactType,
  ) {
    return this.ai.listArtifacts(user.id, repositoryId, type);
  }
}

// Standalone utilities — not tied to a specific repository, so a
// separate controller without the :repositoryId prefix.
@Controller('ai')
@UseGuards(SessionGuard)
export class AiUtilitiesController {
  constructor(private readonly ai: AiProductivityService) {}

  @Post('debug')
  debug(@Body() dto: DebugCodeDto) {
    return this.ai.debugCode(dto.code, dto.errorContext);
  }

  @Post('explain-sql')
  explainSql(@Body() dto: SqlExplainDto) {
    return this.ai.explainSql(dto.query);
  }

  @Post('explain-algorithm')
  explainAlgorithm(@Body() dto: ExplainAlgorithmDto) {
    return this.ai.explainAlgorithm(dto.code);
  }

  @Post('editor-prompt')
  editorPrompt(@Body() dto: EditorAiPromptDto) {
    return this.ai.handleEditorPrompt(dto);
  }

  @Post('editor-review')
  editorReview(@Body() dto: EditorReviewRequestDto) {
    return this.ai.performEditorReview(dto);
  }

  @Post('editor-analyze-errors')
  editorAnalyzeErrors(@Body() dto: EditorReviewRequestDto) {
    return this.ai.performErrorAnalysis(dto);
  }

  @Post('commit-message')
  commitMessage(@Body() dto: CommitMessageDto) {
    return this.ai.generateCommitMessage(dto.diff);
  }
}
