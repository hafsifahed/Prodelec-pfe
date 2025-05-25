import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('mark-read')
  async markAsRead(@Body('id') id: number) {
    await this.notificationsService.markAsRead(id);
    return { message: 'Notification marquée comme lue' };
  }
}
