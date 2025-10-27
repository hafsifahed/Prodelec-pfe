import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Server } from 'socket.io';
import { User } from '../users/entities/users.entity';
import { UsersService } from '../users/users.service';
import { Notification } from './notification.entity';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsService } from './notifications.service';

describe('NotificationsGateway', () => {
  let gateway: NotificationsGateway;
  let server: Server;

  const mockJwtService = {
    verify: jest.fn(),
  };

  const mockNotificationsService = {
    getUnreadNotifications: jest.fn(),
    markAsRead: jest.fn(),
    createNotification: jest.fn(),
  };

  const mockUsersService = {
    findOneById: jest.fn(),
  };

  const mockServer = {
    to: jest.fn().mockReturnThis(),
    emit: jest.fn(),
  };

  const mockUser: User = {
    id: 123,
    username: 'testuser',
    email: 'test@example.com',
    role: { id: 1, name: 'USER' }
  } as User;

  const mockNotification: Notification = {
    id: 1,
    title: 'Test Notification',
    message: 'This is a test notification',
    read: false,
    user: mockUser,
    createdAt: new Date(),
    updatedAt: new Date(),
    payload: { key: 'value' }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsGateway,
        { provide: JwtService, useValue: mockJwtService },
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    gateway = module.get<NotificationsGateway>(NotificationsGateway);
    gateway.server = mockServer as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should verify token and join room on success', async () => {
      const mockClient = {
        handshake: { auth: { token: 'valid-token' } },
        data: {userId:1},
        join: jest.fn(),
        emit: jest.fn(),
        disconnect: jest.fn(),
        id: 'client-id',
        on: jest.fn(),
      };

      mockJwtService.verify.mockReturnValue({ sub: mockUser.id });
      mockUsersService.findOneById.mockResolvedValue(mockUser);
      mockNotificationsService.getUnreadNotifications.mockResolvedValue([mockNotification]);

      await gateway.handleConnection(mockClient as any);

      expect(mockJwtService.verify).toHaveBeenCalledWith('valid-token', { 
        secret: process.env.JWT_ACCESS_SECRET 
      });
      expect(mockUsersService.findOneById).toHaveBeenCalledWith(mockUser.id);
      expect(mockClient.data.userId).toBe(mockUser.id);
      expect(mockClient.join).toHaveBeenCalledWith(mockUser.id.toString());
      expect(mockNotificationsService.getUnreadNotifications).toHaveBeenCalledWith(mockUser.id);
      expect(mockClient.emit).toHaveBeenCalledWith('initial_notifications', [mockNotification]);
      expect(mockClient.on).toHaveBeenCalledWith('markAsRead', expect.any(Function));
    });

    it('should disconnect client when no token is provided', async () => {
    const mockClient = {
      handshake: { auth: {} },
      disconnect: jest.fn(),
      on: jest.fn(), // Add this line
    };

    await gateway.handleConnection(mockClient as any);

    expect(mockClient.disconnect).toHaveBeenCalledWith(true);
    expect(mockJwtService.verify).not.toHaveBeenCalled();
  });

    it('should disconnect client when token verification fails', async () => {
    const mockClient = {
      handshake: { auth: { token: 'invalid-token' } },
      disconnect: jest.fn(),
      on: jest.fn(), // Add this line
    };

    mockJwtService.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    await gateway.handleConnection(mockClient as any);

    expect(mockClient.disconnect).toHaveBeenCalledWith(true);
  });

    it('should disconnect client when user is not found', async () => {
    const mockClient = {
      handshake: { auth: { token: 'valid-token' } },
      disconnect: jest.fn(),
      on: jest.fn(), // Add this line
    };

    mockJwtService.verify.mockReturnValue({ sub: 999 });
    mockUsersService.findOneById.mockResolvedValue(null);

    await gateway.handleConnection(mockClient as any);

    expect(mockClient.disconnect).toHaveBeenCalledWith(true);
  });

    it('should handle markAsRead event from client', async () => {
      const mockClient = {
        handshake: { auth: { token: 'valid-token' } },
        data: {},
        join: jest.fn(),
        emit: jest.fn(),
        disconnect: jest.fn(),
        id: 'client-id',
        on: jest.fn((event, callback) => {
          if (event === 'markAsRead') {
            // Store the callback to test it later
            (mockClient as any).markAsReadCallback = callback;
          }
        }),
      };

      mockJwtService.verify.mockReturnValue({ sub: mockUser.id });
      mockUsersService.findOneById.mockResolvedValue(mockUser);
      mockNotificationsService.getUnreadNotifications.mockResolvedValue([]);

      await gateway.handleConnection(mockClient as any);

      // Test the markAsRead callback
      const notificationId = 1;
      await (mockClient as any).markAsReadCallback(notificationId);

      expect(mockNotificationsService.markAsRead).toHaveBeenCalledWith(notificationId);
    });
  });

  describe('handleDisconnect', () => {
    it('should log client disconnection', () => {
      const mockClient = {
        id: 'client-id',
      };

      const loggerSpy = jest.spyOn(gateway['logger'], 'log');

      gateway.handleDisconnect(mockClient as any);

      expect(loggerSpy).toHaveBeenCalledWith('Client disconnected: client-id');
    });
  });

  describe('sendNotificationToUser', () => {
    it('should send notification to specific user', async () => {
      const userId = 123;
      
      await gateway.sendNotificationToUser(userId, mockNotification);

      expect(mockServer.to).toHaveBeenCalledWith(userId.toString());
      expect(mockServer.emit).toHaveBeenCalledWith('notification', mockNotification);
    });

    it('should handle multiple user notifications', async () => {
      const userIds = [123, 456];
      const notifications = [mockNotification, { ...mockNotification, id: 2 }];

      for (let i = 0; i < userIds.length; i++) {
        await gateway.sendNotificationToUser(userIds[i], notifications[i]);
      }

      expect(mockServer.to).toHaveBeenCalledWith('123');
      expect(mockServer.to).toHaveBeenCalledWith('456');
      expect(mockServer.emit).toHaveBeenCalledTimes(2);
    });
  });

  describe('sendNotificationToAll', () => {
    it('should send notification to all connected clients', async () => {
      const message = 'Broadcast message';
      const payload = { important: true };

      await gateway.sendNotificationToAll(message, payload);

      expect(mockServer.emit).toHaveBeenCalledWith('notification', {
        message,
        payload
      });
    });

    it('should send notification without payload', async () => {
      const message = 'Simple broadcast';

      await gateway.sendNotificationToAll(message);

      expect(mockServer.emit).toHaveBeenCalledWith('notification', {
        message,
        payload: undefined
      });
    });
  });


});