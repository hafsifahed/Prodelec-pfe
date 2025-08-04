import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { User } from '../users/entities/users.entity';
import { WorkflowDiscussionService } from './workflow-discussion.service';

@WebSocketGateway({
  namespace: 'workflow',
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  },
})
export class WorkflowSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private rooms = new Map<number, Set<string>>();

  constructor(
    private readonly discussionService: WorkflowDiscussionService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token || client.handshake.query?.token;
      if (!token) throw new Error('Missing token');

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      });

      client.data.user = payload;

      const discussionId = Number(client.handshake.query?.discussionId);
      if (!discussionId) throw new Error('Missing discussionId');

      await this.discussionService.validateParticipant(discussionId, payload.sub);

      client.join(`discussion_${discussionId}`);

      if (!this.rooms.has(discussionId)) {
        this.rooms.set(discussionId, new Set());
      }
      this.rooms.get(discussionId).add(client.id);

      console.log(`Client ${client.id} joined discussion ${discussionId}`);
    } catch (error) {
      console.error('Connection error:', error.message);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    for (const [discussionId, clients] of this.rooms.entries()) {
      if (clients.delete(client.id)) {
        console.log(`Client ${client.id} left discussion ${discussionId}`);
        if (clients.size === 0) {
          this.rooms.delete(discussionId);
        }
        break;
      }
    }
  }

  @SubscribeMessage('new_message')
  async handleNewMessage(
    client: Socket,
    payload: { discussionId: number; content: string },
  ) {
    try {
      const userPayload = client.data.user;
      if (!userPayload) throw new Error('Unauthorized');

      const author: User = { id: userPayload.sub } as User;

      const message = await this.discussionService.addMessage(
        payload.discussionId,
        { content: payload.content },
        author,
      );

      this.server.to(`discussion_${payload.discussionId}`).emit('message_created', {
        id: message.id,
        content: message.content,
        createdAt: message.createdAt,
        type: message.type,
        author: {
          id: userPayload.sub,
          firstName: userPayload.firstName,
          lastName: userPayload.lastName,
          image: userPayload.image,
        },
      });
    } catch (err) {
      client.emit('error', { message: err.message });
    }
  }

  @SubscribeMessage('typing')
  handleTyping(client: Socket, payload: { discussionId: number }) {
    const user = client.data.user;
    if (!user) return;

    client.broadcast.to(`discussion_${payload.discussionId}`).emit('typing', {
      discussionId: payload.discussionId,
      userId: user.sub,
    });
  }
}
