import {UserModel} from "./user.models";

export class UserSessionModels {
    id: number;
    usermail: string;
    user: UserModel;
    sessionStart: Date;
    sessionEnd: Date;
    ipAddress: string;
    createdAt: string;
    updatedAt: string;
}