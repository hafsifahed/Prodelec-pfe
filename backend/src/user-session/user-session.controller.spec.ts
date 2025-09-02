import { Test, TestingModule } from '@nestjs/testing';
import { UserSessionController } from './user-session.controller';
import { UserSessionService } from './user-session.service';

describe('UserSessionController', () => {
  let controller: UserSessionController;
  let service: UserSessionService;

  const mockUserSessionService = {
    createSession: jest.fn(),
    endSession: jest.fn(),
    updateSession: jest.fn(),
    getAllSessions: jest.fn(),
    getSessionById: jest.fn(),
    isSessionActive: jest.fn(),
    deleteSession: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserSessionController],
      providers: [
        {
          provide: UserSessionService,
          useValue: mockUserSessionService,
        },
      ],
    }).compile();

    controller = module.get<UserSessionController>(UserSessionController);
    service = module.get<UserSessionService>(UserSessionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('startSession', () => {
    it('should call service createSession and return result', async () => {
      const dto = { usermail: 'test@example.com', ipAddress: '127.0.0.1', userId: 1 };
      const mockResult = { id: 1, ...dto, sessionStart: new Date() };
      mockUserSessionService.createSession.mockResolvedValue(mockResult);

      await expect(controller.startSession(dto)).resolves.toEqual(mockResult);
      expect(service.createSession).toHaveBeenCalledWith(dto);
    });
  });

  describe('endSession', () => {
    it('should call service endSession and return success', async () => {
      const id = 1;
      mockUserSessionService.endSession.mockResolvedValue(true);

      await expect(controller.endSession(id)).resolves.toEqual({ success: true });
      expect(service.endSession).toHaveBeenCalledWith(id);
    });
  });

  describe('updateSession', () => {
    it('should call service updateSession and return updated session', async () => {
      const dto = { id: 1, ipAddress: '127.0.0.2' };
      const mockUpdated = { id: 1, ipAddress: '127.0.0.2', sessionStart: new Date() };
      mockUserSessionService.updateSession.mockResolvedValue(mockUpdated);

      await expect(controller.updateSession(dto)).resolves.toEqual(mockUpdated);
      expect(service.updateSession).toHaveBeenCalledWith(dto);
    });
  });

  describe('getAllSessions', () => {
    it('should return all sessions', async () => {
      const sessions = [{ id: 1 }, { id: 2 }];
      mockUserSessionService.getAllSessions.mockResolvedValue(sessions);

      await expect(controller.getAllSessions()).resolves.toEqual(sessions);
      expect(service.getAllSessions).toHaveBeenCalled();
    });
  });

  describe('getSessionById', () => {
    it('should return a session by id', async () => {
      const id = 1;
      const session = { id, usermail: 'test@example.com' };
      mockUserSessionService.getSessionById.mockResolvedValue(session);

      await expect(controller.getSessionById(id)).resolves.toEqual(session);
      expect(service.getSessionById).toHaveBeenCalledWith(id);
    });
  });

  describe('isSessionActive', () => {
    it('should return boolean active status', async () => {
      const id = 1;
      mockUserSessionService.isSessionActive.mockResolvedValue(true);

      await expect(controller.isSessionActive(id)).resolves.toEqual(true);
      expect(service.isSessionActive).toHaveBeenCalledWith(id);
    });
  });

  describe('deleteSession', () => {
    it('should call service deleteSession and return result', async () => {
      const id = 1;
      mockUserSessionService.deleteSession.mockResolvedValue(true);

      await expect(controller.deleteSession(id)).resolves.toEqual(true);
      expect(service.deleteSession).toHaveBeenCalledWith(id);
    });
  });
});
