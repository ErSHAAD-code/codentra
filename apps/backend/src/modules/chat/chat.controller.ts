import { Body, Controller, Delete, Get, Param, Post, Res, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { Response } from 'express';

import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/chat.dto';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { SessionGuard } from '@/modules/auth/guards/session.guard';


@Controller('repositories/:repositoryId/chats')
@UseGuards(SessionGuard)
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  @Post()
  create(@CurrentUser() user: User, @Param('repositoryId') repositoryId: string) {
    return this.chat.createChat(user.id, repositoryId);
  }

  @Get()
  list(@CurrentUser() user: User, @Param('repositoryId') repositoryId: string) {
    return this.chat.listChats(user.id, repositoryId);
  }

  @Get(':chatId/messages')
  listMessages(@CurrentUser() user: User, @Param('chatId') chatId: string) {
    return this.chat.listMessages(user.id, chatId);
  }

  @Post(':chatId/messages')
  async sendMessage(
    @CurrentUser() user: User,
    @Param('chatId') chatId: string,
    @Body() dto: SendMessageDto,
    @Res() res: Response,
  ) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      for await (const chunk of this.chat.sendMessage(user.id, chatId, dto.content)) {
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'AI provider error';
      res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
    }
    res.write('data: [DONE]\n\n');
    res.end();
  }

  @Delete(':chatId')
  deleteChat(@CurrentUser() user: User, @Param('chatId') chatId: string) {
    return this.chat.deleteChat(user.id, chatId);
  }
}
