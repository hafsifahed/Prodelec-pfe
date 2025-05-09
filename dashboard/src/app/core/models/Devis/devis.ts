import { CahierDesCharges } from "../CahierDesCharges/cahier-des-charges";
import { UserModel } from "../user.models";

export class Devis {
    id: number;
    projet: string;
    pieceJointe: string;
    etat: string = "En attente";
    commentaire: string;
    dateCreation: Date;
    archive: boolean;
    archiveU: boolean;
    cahierDesCharges: CahierDesCharges;
    user: UserModel;
}
