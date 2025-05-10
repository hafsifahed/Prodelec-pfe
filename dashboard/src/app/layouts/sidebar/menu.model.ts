export interface RolePermissions {
    resource: string;
    actions: string[];
  }
  

export interface MenuItem {
    id?: number;
    label?: string;
    icon?: string;
    link?: string;
    subItems?: MenuItem[];
    isTitle?: boolean;
    badge?: any;
    parentId?: number;
    isLayout?: boolean;
    rolePermissions?: RolePermissions[];  // <-- map roles to permissions
}