import { User } from "./auth.models";

export class Partner {
    id: number;
    address: string;
    name: string;
    tel: string;
    users:User[];
    createdAt: string;
    updatedAt: string;
}