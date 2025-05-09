// user.model.ts
import {UserSessionModels} from "./user-session.models";

export class UserEditDto {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    password:string;
    role: string;
    userSessions:UserSessionModels[];


}