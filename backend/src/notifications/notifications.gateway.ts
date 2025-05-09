import { Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', // Adjust for your frontend URL in production
    methods: ['GET', 'POST'],
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('NotificationsGateway');

  constructor(private readonly jwtService: JwtService) {}

  handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      if (!token) {
        throw new UnauthorizedException('No token provided');
      }
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'your_jwt_secret',
      });
      client.data.userId = payload.sub; // store userId for later use
      client.join(payload.sub); // join room by userId
      this.logger.log(`Client connected: ${client.id}, userId: ${payload.sub}`);
    } catch (err) {
      this.logger.warn(`Client connection rejected: ${client.id} - ${err.message}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  sendNotificationToUser(userId: string, payload: any) {
    this.server.to(userId).emit('notification', payload);
  }

  sendNotificationToAll(payload: any) {
    this.server.emit('notification', payload);
  }
}
