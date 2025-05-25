import { forwardRef, Inject, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UsersService } from '../users/users.service';
import { Notification } from './notification.entity';
import { NotificationsService } from './notifications.service';

@WebSocketGateway({
  cors: {
    origin: '*', // En prod, mettre l’URL frontend
    methods: ['GET', 'POST'],
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('NotificationsGateway');

  constructor(
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => NotificationsService))
    private readonly notificationsService: NotificationsService,
    private readonly usersService: UsersService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      if (!token) throw new UnauthorizedException('No token provided');

      const payload = this.jwtService.verify(token, { secret: process.env.JWT_ACCESS_SECRET });
      const user = await this.usersService.findOneById(payload.sub);
      if (!user) throw new UnauthorizedException('User not found');

      client.data.userId = user.id;
      client.join(user.id.toString());

      // Envoyer notifications non lues au client
      const notifications = await this.notificationsService.getUnreadNotifications(user.id);
      client.emit('initial_notifications', notifications);

      this.logger.log(`Client connected: ${client.id}, userId: ${user.id}`);
    } catch (err) {
      this.logger.warn(`Connection rejected: ${client.id} - ${err.message}`);
      client.disconnect(true);
    }
    client.on('markAsRead', async (notificationId: number) => {
    await this.notificationsService.markAsRead(notificationId);
    // Optionnel : tu peux émettre un événement de confirmation ici
  });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  async sendNotificationToUser(userId: number, notification: Notification) {
  this.server.to(userId.toString()).emit('notification', notification);
}

  async sendNotificationToAll(message: string, payload?: any) {
    // Optionnel : créer notifications en base pour tous les utilisateurs
    this.server.emit('notification', { message, payload });
  }
}
