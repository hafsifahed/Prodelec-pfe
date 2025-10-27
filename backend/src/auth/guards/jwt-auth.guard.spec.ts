import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';

// Mock the parent AuthGuard
jest.mock('@nestjs/passport', () => ({
  AuthGuard: jest.fn().mockImplementation(() => {
    return class MockAuthGuard {
      canActivate(context: ExecutionContext) {
        return Promise.resolve(true);
      }
    };
  }),
}));

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  const createMockContext = (handler?: any, classRef?: any, headers: any = {}): ExecutionContext => {
    return {
      getHandler: () => handler || (() => {}),
      getClass: () => classRef || class MockClass {},
      switchToHttp: () => ({
        getRequest: () => ({
          headers,
        }),
      }),
    } as ExecutionContext;
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        { provide: Reflector, useValue: mockReflector },
      ],
    }).compile();

    guard = moduleRef.get<JwtAuthGuard>(JwtAuthGuard);
    jest.clearAllMocks();
  });





  describe('reflector integration', () => {
    it('should call parent when public decorator is false', async () => {
      // Arrange
      const handler = () => {};
      const classRef = class {};
      const context = createMockContext(handler, classRef);

      mockReflector.getAllAndOverride.mockReturnValue(false);

      // Create spy before calling
      const parentCanActivateSpy = jest.spyOn(
        Object.getPrototypeOf(JwtAuthGuard.prototype),
        'canActivate'
      ).mockResolvedValue(true);

      // Act
      const result = await guard.canActivate(context);

      // Assert
      expect(result).toBe(true);
      expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(
        IS_PUBLIC_KEY,
        [handler, classRef]
      );
      expect(parentCanActivateSpy).toHaveBeenCalledWith(context);
      
      parentCanActivateSpy.mockRestore();
    });
  });
});