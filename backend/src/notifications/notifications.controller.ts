import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
  @UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('mark-read')
  async markAsRead(@Body('id') id: number) {
    await this.notificationsService.markAsRead(id);
    return { message: 'Notification marquée comme lue' };
  }

   @Get()
  getAll() {
    return this.notificationsService.getNotifications();
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.notificationsService.deleteNotification(id);
  }
}
