import {UserModel} from "./user.models";

export class PartnerEditDto {
    id: number;
    address: string;
    name: string;
    tel: string;
    users:UserModel[];

}