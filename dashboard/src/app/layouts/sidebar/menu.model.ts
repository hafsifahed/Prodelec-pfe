import { Action, Resource, RoleName } from "src/app/core/models/role.model";

export interface MenuItemRolePermissions {
  resource: Resource;
  actions: Action[];
  roles?: RoleName[]; 
}

export interface MenuItem {
  id: number;
  label: string;
  icon?: string;
  link?: string;
  subItems?: MenuItem[];
  isTitle?: boolean;
  badge?: any;
  parentId?: number;
  isLayout?: boolean;
  rolePermissions?: MenuItemRolePermissions[];
  accessOnly?: 'CLIENT' | 'WORKER';
  external?: boolean;
}