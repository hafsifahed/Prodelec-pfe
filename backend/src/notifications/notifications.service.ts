import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/users.entity';
import { UsersService } from '../users/users.service';
import { Notification } from './notification.entity';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
        @Inject(forwardRef(() => NotificationsGateway))
        private readonly notificationsGateway: NotificationsGateway,
        private readonly usersService: UsersService,

  ) {}

  async notifyAdmins(title: string,message: string, payload?: any): Promise<Notification[]> {
  const admins = await this.usersService.findAdmins();
  const notifications: Notification[] = [];

  for (const admin of admins) {
const notification = await this.createNotification(admin, title, message, payload);
    notifications.push(notification);
    this.notificationsGateway.sendNotificationToUser(admin.id, notification);
  }
  return notifications;
}

 async createAndSendNotification(user: User, title: string, message: string, payload?: any): Promise<Notification> {
    const notification = await this.createNotification(user, title, message, payload);
    this.notificationsGateway.sendNotificationToUser(user.id, notification);
    return notification;
  }

async createNotification(user: User, title: string, message: string, payload?: any): Promise<Notification> {
  const notification = this.notificationRepository.create({ user, title, message, payload });
  return this.notificationRepository.save(notification);
}



  async getUnreadNotifications(userId: number): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { user: { id: userId }, read: false },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(notificationId: number): Promise<void> {
    await this.notificationRepository.update(notificationId, { read: true });
  }

  async getNotifications(): Promise<Notification[]> {
    // Charge toutes les notifications, avec user créateur si besoin
    return this.notificationRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async deleteNotification(notificationId: number): Promise<void> {
    await this.notificationRepository.delete(notificationId);
  }

   async getNotificationsForUser(userId: number): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }
}
