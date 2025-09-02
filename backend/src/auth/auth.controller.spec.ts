import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users/users.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let usersService: UsersService;

  const mockAuthService = {
    login: jest.fn(),
    refreshAccessToken: jest.fn(),
    logout: jest.fn(),
  };

  const mockUsersService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call authService.login and return tokens', async () => {
      const user = { id: 1, username: 'testuser' };
      const ipAddress = '127.0.0.1';
      const loginResponse = {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        sessionId: 123,
      };

      mockAuthService.login.mockResolvedValue(loginResponse);

      // Simulate @Request() req with user and ip
      const req = { user, ip: ipAddress };

      await expect(controller.login(req, ipAddress)).resolves.toEqual(loginResponse);
      expect(mockAuthService.login).toHaveBeenCalledWith(user, ipAddress);
    });
  });


  describe('refreshToken', () => {
    it('should call authService.refreshAccessToken and return new access token', async () => {
      const refreshToken = 'some-refresh-token';
      const newAccessToken = { access_token: 'new-access-token' };

      mockAuthService.refreshAccessToken.mockResolvedValue(newAccessToken);

      await expect(controller.refreshToken(refreshToken)).resolves.toEqual(newAccessToken);
      expect(mockAuthService.refreshAccessToken).toHaveBeenCalledWith(refreshToken);
    });
  });

  describe('logout', () => {
    it('should call authService.logout and confirm logout', async () => {
      const sessionId = 123;

      mockAuthService.logout.mockResolvedValue(undefined);

      await expect(controller.logout(sessionId)).resolves.toEqual({ message: 'Logged out successfully' });
      expect(mockAuthService.logout).toHaveBeenCalledWith(sessionId);
    });
  });
});
