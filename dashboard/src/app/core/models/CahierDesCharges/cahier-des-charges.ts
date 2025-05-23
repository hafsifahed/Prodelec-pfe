import { User } from "../auth.models";
import { UserModel } from "../user.models";

export class CahierDesCharges {
    id : number;
    titre: string;
    description: string;
    pieceJointe: string;
    commentaire: string;
    etat: string;
    dateCreation: Date;
    archive:boolean;
    archiveU:boolean;
    user: User;
}
