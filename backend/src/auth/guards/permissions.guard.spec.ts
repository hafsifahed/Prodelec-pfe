import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { Action } from '../../roles/enums/action.enum';
import { Resource } from '../../roles/enums/resource.enum';
import { RequiredPermission } from '../decorators/permissions.decorator';
import { PermissionsGuard } from './permissions.guard';

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: Reflector;

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  const createMockContext = (user: any, handler?: Function, classRef?: Function): ExecutionContext => {
    return {
      getHandler: () => handler || jest.fn(),
      getClass: () => classRef || jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          user,
        }),
      }),
    } as ExecutionContext;
  };

  const mockUserWithPermissions = (permissions: any[]) => ({
    id: 1,
    username: 'testuser',
    role: {
      id: 1,
      name: 'TEST_ROLE',
      permissions,
    },
  });

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        PermissionsGuard,
        { provide: Reflector, useValue: mockReflector },
      ],
    }).compile();

    guard = moduleRef.get<PermissionsGuard>(PermissionsGuard);
    reflector = moduleRef.get<Reflector>(Reflector);
    
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('when no permissions are required', () => {


    it('should return true if permissions array is empty', () => {
      mockReflector.getAllAndOverride.mockReturnValue([]);
      const context = createMockContext(mockUserWithPermissions([]));

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });
  });

  describe('when user is missing or has no role', () => {
    it('should throw ForbiddenException when user is missing', () => {
      const requiredPermissions: RequiredPermission[] = [
        { resource: Resource.USERS, actions: [Action.READ] } // Use enum values
      ];
      mockReflector.getAllAndOverride.mockReturnValue(requiredPermissions);
      const context = createMockContext(null);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow('User or role not found');
    });

    it('should throw ForbiddenException when user has no role', () => {
      const requiredPermissions: RequiredPermission[] = [
        { resource: Resource.USERS, actions: [Action.READ] } // Use enum values
      ];
      mockReflector.getAllAndOverride.mockReturnValue(requiredPermissions);
      const context = createMockContext({ id: 1, username: 'testuser' });

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow('User or role not found');
    });
  });

  describe('when user has insufficient permissions', () => {
    it('should throw ForbiddenException when user has no permissions at all', () => {
      const requiredPermissions: RequiredPermission[] = [
        { resource: Resource.USERS, actions: [Action.READ] } // Use enum values
      ];
      mockReflector.getAllAndOverride.mockReturnValue(requiredPermissions);
      const user = mockUserWithPermissions([]);
      const context = createMockContext(user);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow('Insufficient permissions');
    });

    it('should throw ForbiddenException when user lacks required resource', () => {
      const requiredPermissions: RequiredPermission[] = [
        { resource: Resource.USERS, actions: [Action.READ] } // Use enum values
      ];
      mockReflector.getAllAndOverride.mockReturnValue(requiredPermissions);
      const user = mockUserWithPermissions([
        { resource: Resource.PROJECT, actions: [Action.READ, Action.UPDATE] } // Use enum values
      ]);
      const context = createMockContext(user);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when user lacks required action', () => {
      const requiredPermissions: RequiredPermission[] = [
        { resource: Resource.USERS, actions: [Action.DELETE] } // Use enum values
      ];
      mockReflector.getAllAndOverride.mockReturnValue(requiredPermissions);
      const user = mockUserWithPermissions([
        { resource: Resource.USERS, actions: [Action.READ, Action.UPDATE] } // Use enum values
      ]);
      const context = createMockContext(user);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException for multiple required permissions when one is missing', () => {
      const requiredPermissions: RequiredPermission[] = [
        { resource: Resource.USERS, actions: [Action.READ] }, // Use enum values
        { resource: Resource.PROJECT, actions: [Action.UPDATE] } // Use enum values
      ];
      mockReflector.getAllAndOverride.mockReturnValue(requiredPermissions);
      const user = mockUserWithPermissions([
        { resource: Resource.USERS, actions: [Action.READ] }, // Has first permission
        // Missing PROJECT:UPDATE
      ]);
      const context = createMockContext(user);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });
  });

  describe('when user has sufficient permissions', () => {
    it('should return true when user has exact required permission', () => {
      const requiredPermissions: RequiredPermission[] = [
        { resource: Resource.USERS, actions: [Action.READ] } // Use enum values
      ];
      mockReflector.getAllAndOverride.mockReturnValue(requiredPermissions);
      const user = mockUserWithPermissions([
        { resource: Resource.USERS, actions: [Action.READ] } // Use enum values
      ]);
      const context = createMockContext(user);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should return true when user has more actions than required', () => {
      const requiredPermissions: RequiredPermission[] = [
        { resource: Resource.USERS, actions: [Action.READ] } // Use enum values
      ];
      mockReflector.getAllAndOverride.mockReturnValue(requiredPermissions);
      const user = mockUserWithPermissions([
        { resource: Resource.USERS, actions: [Action.READ, Action.UPDATE, Action.DELETE] } // Use enum values
      ]);
      const context = createMockContext(user);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should return true when user has at least one required action', () => {
      const requiredPermissions: RequiredPermission[] = [
        { resource: Resource.USERS, actions: [Action.READ, Action.UPDATE] } // Use enum values
      ];
      mockReflector.getAllAndOverride.mockReturnValue(requiredPermissions);
      const user = mockUserWithPermissions([
        { resource: Resource.USERS, actions: [Action.UPDATE] } // Has one of the required actions
      ]);
      const context = createMockContext(user);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should return true for multiple required permissions', () => {
      const requiredPermissions: RequiredPermission[] = [
        { resource: Resource.USERS, actions: [Action.READ] }, // Use enum values
        { resource: Resource.PROJECT, actions: [Action.UPDATE] } // Use enum values
      ];
      mockReflector.getAllAndOverride.mockReturnValue(requiredPermissions);
      const user = mockUserWithPermissions([
        { resource: Resource.USERS, actions: [Action.READ, Action.UPDATE] }, // Use enum values
        { resource: Resource.PROJECT, actions: [Action.READ, Action.UPDATE, Action.DELETE] } // Use enum values
      ]);
      const context = createMockContext(user);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should log user permissions when debugging', () => {
      const requiredPermissions: RequiredPermission[] = [
        { resource: Resource.USERS, actions: [Action.READ] } // Use enum values
      ];
      mockReflector.getAllAndOverride.mockReturnValue(requiredPermissions);
      const userPermissions = [{ resource: Resource.USERS, actions: [Action.READ] }]; // Use enum values
      const user = mockUserWithPermissions(userPermissions);
      const context = createMockContext(user);

      guard.canActivate(context);

      expect(console.log).toHaveBeenCalledWith('User perm:', userPermissions[0]);
    });
  });

  // ... rest of your tests with the same enum replacements
});