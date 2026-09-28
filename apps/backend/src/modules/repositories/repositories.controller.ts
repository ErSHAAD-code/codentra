import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { SessionGuard } from '@/modules/auth/guards/session.guard';

import { CreateRepositoryDto, NewRepositoryDto } from './dto/repository.dto';
import { RepositoriesService } from './repositories.service';

@Controller('repositories')
@UseGuards(SessionGuard)
export class RepositoriesController {
  constructor(private readonly repositories: RepositoriesService) {}

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateRepositoryDto) {
    return this.repositories.create(user.id, dto);
  }

  @Get('mine')
  findAllMine(@CurrentUser() user: User) {
    return this.repositories.findAllForUser(user.id);
  }

  @Post('quick-start')
  quickStart(@CurrentUser() user: User) {
    return this.repositories.quickStart(user.id);
  }

  @Post('new')
  createForUpload(@CurrentUser() user: User, @Body() dto: NewRepositoryDto) {
    return this.repositories.createForUpload(user.id, dto.name);
  }

  @Get()
  findAll(@CurrentUser() user: User, @Query('projectId') projectId: string) {
    return this.repositories.findAllForProject(user.id, projectId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.repositories.findOne(user.id, id);
  }

  @Get(':id/tree')
  getTree(@CurrentUser() user: User, @Param('id') id: string) {
    return this.repositories.getTree(user.id, id);
  }

  @Get(':id/files/:fileId')
  getFile(@CurrentUser() user: User, @Param('id') id: string, @Param('fileId') fileId: string) {
    return this.repositories.getFile(user.id, id, fileId);
  }

  @Patch(':id/archive')
  archive(@CurrentUser() user: User, @Param('id') id: string) {
    return this.repositories.archive(user.id, id);
  }

  @Delete(':id')
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.repositories.remove(user.id, id);
  }
}
