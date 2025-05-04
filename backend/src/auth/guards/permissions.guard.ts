import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY, RequiredPermission } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions =
      this.reflector.getAllAndOverride<RequiredPermission[]>(PERMISSIONS_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
  
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }
  
    const request = context.switchToHttp().getRequest();
    const user = request.user;
  
    console.log('User:', user);
    console.log('User role:', user.role);
    console.log('Role permissions:', user.role?.permissions);
    console.log('Required permissions:', requiredPermissions);
  
    const rolePermissions = user.role?.permissions || [];
  
    const hasPermission = requiredPermissions.every(({ resource, actions }) => {
      const perm = rolePermissions.find(p => p.resource === resource);
      if (!perm) return false;
      return actions.every(action => perm.actions.includes(action));
    });
  
    console.log('Has permission:', hasPermission);
  
    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }
  
    return true;
  }
  
}
