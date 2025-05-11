import { Partner } from "./partner.models";

export enum Resource {
    USERS = 'users',
    DASHBOARD = 'dashboard',
    // add others as needed
  }
  
  export enum Action {
    CREATE = 'create',
    READ = 'read',
    UPDATE = 'update',
    DELETE = 'delete',
    // add others as needed
  }
  
  export interface Permission {
    resource: Resource | string;
    actions: Action[] | string[];
  }
  
  export interface Role {
    id: number;
    name: string;
    permissions: Permission[];
  }
  
  export interface User {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    accountStatus: string;
    createdAt: string;
    updatedAt: string;
    role: Role;
    partner?: Partner;
  }
  