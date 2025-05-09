import {UserModel} from "./user.models";

export class Partner {
    id: number;
    address: string;
    name: string;
    tel: string;
    users:UserModel[];
    createdAt: string;
    updatedAt: string;
}