import { Partner } from "./partner.models";
import { Role } from "./role.model";
export enum AccountStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

  
  export interface User {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    image?:string;
    accountStatus: string;
    createdAt: string;
    updatedAt: string;
    role: Role;
    partner?: Partner;
  }
  