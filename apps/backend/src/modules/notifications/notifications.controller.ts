import { Controller, Get, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';

import { NotificationsService } from './notifications.service';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { SessionGuard } from '@/modules/auth/guards/session.guard';


@Controller('notifications')
@UseGuards(SessionGuard)
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  list(@CurrentUser() user: User, @Query('unreadOnly') unreadOnly?: string) {
    return this.notifications.list(user.id, unreadOnly === 'true');
  }

  @Patch(':id/read')
  markRead(@CurrentUser() user: User, @Param('id') id: string) {
    return this.notifications.markRead(user.id, id);
  }

  @Patch('read-all')
  markAllRead(@CurrentUser() user: User) {
    return this.notifications.markAllRead(user.id);
  }
}
