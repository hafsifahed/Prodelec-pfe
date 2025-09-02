import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users/users.service';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsService } from './notifications.service';

describe('NotificationsGateway', () => {
  let gateway: NotificationsGateway;

  const mockJwtService = {
    verify: jest.fn(),
  };

  const mockNotificationsService = {
    getUnreadNotifications: jest.fn(),
    markAsRead: jest.fn(),
  };

  const mockUsersService = {
    findOneById: jest.fn(),
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
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  // Optionally, add a test for handleConnection to check token verification and user fetching
  it('handleConnection should verify token and join room on success', async () => {
    const mockClient = {
      handshake: { auth: { token: 'valid-token' } },
      data: {},
      join: jest.fn(),
      emit: jest.fn(),
      disconnect: jest.fn(),
      id: 'client-id',
      on: jest.fn(),
    };

    const user = { id: 123 };
    mockJwtService.verify.mockReturnValue({ sub: user.id });
    mockUsersService.findOneById.mockResolvedValue(user);
    mockNotificationsService.getUnreadNotifications.mockResolvedValue(['notif1', 'notif2']);

    await gateway.handleConnection(mockClient as any);

    expect(mockJwtService.verify).toHaveBeenCalledWith('valid-token', { secret: process.env.JWT_ACCESS_SECRET });
    expect(mockUsersService.findOneById).toHaveBeenCalledWith(user.id);
    expect((mockClient.data as any).userId).toBe(user.id);
    expect(mockClient.join).toHaveBeenCalledWith(user.id.toString());
    expect(mockClient.emit).toHaveBeenCalledWith('initial_notifications', ['notif1', 'notif2']);
  });

  // Add more tests for other gateway methods if needed
});
