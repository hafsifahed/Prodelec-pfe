// user.model.ts
import {UserSessionModels} from "./user-session.models";
import {Partner} from "./partner.models";

export class UserModel {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    password:string;
    role: string;
    userSessions:UserSessionModels[];
    partner:Partner;
    createdAt: string;
    updatedAt: string;

}