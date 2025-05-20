import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY, RequiredPermission } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Retrieve permissions metadata from handler or controller
    const requiredPermissions =
      this.reflector.getAllAndOverride<RequiredPermission[]>(PERMISSIONS_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);


    // If no permissions are required, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Ensure user and role exist
    if (!user || !user.role) {
      throw new ForbiddenException('User or role not found');
    }

    // Extract permissions from user role
    const rolePermissions = user.role.permissions || [];

    // Check if user role has all required permissions for each resource
    const hasPermission = requiredPermissions.every(({ resource, actions }) => {
      const perm = rolePermissions.find(p => p.resource === resource);
      if (!perm) return false;
      // User must have at least one of the required actions
      return actions.some(action => perm.actions.includes(action));
    });
    

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
