import { Partner } from "./partner.models";
import { Role } from "./role.model";


  
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
  