import { UserModel } from "./user.models";

export class Reclamation {
    id_Reclamation: number;
    description: string;
    type_de_defaut: string;
    status: string;
    pieceJointe:String;
    reponse:String;
    archive: boolean;
    archiveU: boolean;

    dateDeCreation: Date;
    user: UserModel;
}
