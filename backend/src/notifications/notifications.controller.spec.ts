import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../users/entities/users.entity';
import { Notification } from './notification.entity';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let service: NotificationsService;

  const mockNotificationsService = {
    markAsRead: jest.fn(),
    getNotifications: jest.fn(),
    deleteNotification: jest.fn(),
    getNotificationsForUser: jest.fn(),
  };

  const mockUser: User = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    role: { id: 1, name: 'USER' }
  } as User;

  const mockNotification: Notification = {
    id: 1,
    title: 'Test Notification',
    message: 'This is a test',
    read: false,
    user: mockUser,
    payload: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
    service = module.get<NotificationsService>(NotificationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('markAsRead', () => {
    it('should mark notification as read and return success message', async () => {
      const notificationId = 1;
      mockNotificationsService.markAsRead.mockResolvedValue(undefined);

      const result = await controller.markAsRead(notificationId);

      expect(result).toEqual({ message: 'Notification marquée comme lue' });
      expect(mockNotificationsService.markAsRead).toHaveBeenCalledWith(notificationId);
    });

    it('should handle errors when marking notification as read', async () => {
      const notificationId = 999;
      mockNotificationsService.markAsRead.mockRejectedValue(new Error('Notification not found'));

      await expect(controller.markAsRead(notificationId)).rejects.toThrow('Notification not found');
    });
  });

  describe('getAll', () => {
    it('should return all notifications', async () => {
      const notifications = [mockNotification, { ...mockNotification, id: 2 }];
      mockNotificationsService.getNotifications.mockResolvedValue(notifications);

      const result = await controller.getAll();

      expect(result).toEqual(notifications);
      expect(mockNotificationsService.getNotifications).toHaveBeenCalled();
    });

    it('should return empty array when no notifications exist', async () => {
      mockNotificationsService.getNotifications.mockResolvedValue([]);

      const result = await controller.getAll();

      expect(result).toEqual([]);
    });
  });

  describe('delete', () => {
    it('should delete notification successfully', async () => {
      const notificationId = 1;
      mockNotificationsService.deleteNotification.mockResolvedValue(undefined);

      const result = await controller.delete(notificationId);

      expect(result).toBeUndefined();
      expect(mockNotificationsService.deleteNotification).toHaveBeenCalledWith(notificationId);
    });

    it('should handle errors when deleting notification', async () => {
      const notificationId = 999;
      mockNotificationsService.deleteNotification.mockRejectedValue(new Error('Not found'));

      await expect(controller.delete(notificationId)).rejects.toThrow('Not found');
    });
  });

  describe('getForCurrentUser', () => {
    it('should return notifications for current user', async () => {
      const userNotifications = [mockNotification];
      mockNotificationsService.getNotificationsForUser.mockResolvedValue(userNotifications);

      const result = await controller.getForCurrentUser(mockUser);

      expect(result).toEqual(userNotifications);
      expect(mockNotificationsService.getNotificationsForUser).toHaveBeenCalledWith(mockUser.id);
    });

    it('should return empty array when user has no notifications', async () => {
      mockNotificationsService.getNotificationsForUser.mockResolvedValue([]);

      const result = await controller.getForCurrentUser(mockUser);

      expect(result).toEqual([]);
      expect(mockNotificationsService.getNotificationsForUser).toHaveBeenCalledWith(mockUser.id);
    });

    it('should handle different user IDs', async () => {
      const differentUser = { ...mockUser, id: 2 };
      const userNotifications = [{ ...mockNotification, id: 5 }];
      mockNotificationsService.getNotificationsForUser.mockResolvedValue(userNotifications);

      const result = await controller.getForCurrentUser(differentUser);

      expect(result).toEqual(userNotifications);
      expect(mockNotificationsService.getNotificationsForUser).toHaveBeenCalledWith(differentUser.id);
    });
  });

  describe('edge cases', () => {
    it('should handle markAsRead with invalid ID', async () => {
      const invalidId = 'invalid' as any;
      mockNotificationsService.markAsRead.mockRejectedValue(new Error('Invalid ID'));

      await expect(controller.markAsRead(invalidId)).rejects.toThrow('Invalid ID');
    });

    it('should handle delete with non-existent ID', async () => {
      const nonExistentId = 9999;
      mockNotificationsService.deleteNotification.mockRejectedValue(new Error('Not found'));

      await expect(controller.delete(nonExistentId)).rejects.toThrow('Not found');
    });

    it('should handle user with no role in getForCurrentUser', async () => {
      const userWithoutRole = { id: 3, username: 'norole' } as User;
      mockNotificationsService.getNotificationsForUser.mockResolvedValue([]);

      const result = await controller.getForCurrentUser(userWithoutRole);

      expect(result).toEqual([]);
      expect(mockNotificationsService.getNotificationsForUser).toHaveBeenCalledWith(userWithoutRole.id);
    });
  });
});