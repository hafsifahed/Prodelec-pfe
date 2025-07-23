import { User } from "./auth.models";

export class Partner {
    id: number;
    address: string;
    name: string;
    tel: string;
    image?: string;
    users:User[];
    createdAt?: string;
    updatedAt?: string;
}