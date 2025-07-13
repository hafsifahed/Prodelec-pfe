import { User } from "./auth.models";
import {UserModel} from "./user.models";

export class PartnerEditDto {
    id: number;
    address: string;
    name: string;
    tel: string;
    users:User[];
    imageUrl?: string; // <-- pour stocker l'image actuelle

}