import { User } from "./auth.models";

export enum PartnerStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
  }
  
export class Partner {
    id: number;
    address: string;
    name: string;
    tel: string;
    image?: string;
    partnerStatus?:string;
    users:User[];
    createdAt?: string;
    updatedAt?: string;
}