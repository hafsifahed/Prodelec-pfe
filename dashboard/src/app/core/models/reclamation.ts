import { User } from "./auth.models";

export class Reclamation {
    id_reclamation: number;
    description: string;
    type_de_defaut: string;
    status: string;
    PieceJointe:String;
    reponse:String;
    archive: boolean;
    archiveU: boolean;

    dateDeCreation: Date;
    user: User;
}
