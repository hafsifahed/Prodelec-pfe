// permissions.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { Action } from '../../roles/enums/action.enum';
import { Resource } from '../../roles/enums/resource.enum';

export const PERMISSIONS_KEY = 'permissions';

export interface RequiredPermission {
  resource: Resource;
  actions: Action[];
}

export const Permissions = (...permissions: RequiredPermission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
