import { User } from "../auth.models";
import { CahierDesCharges } from "../CahierDesCharges/cahier-des-charges";

export enum EtatDevis {
  EnAttente = 'En attente',
  Accepte = 'Accepté',
  Refuse = 'Refusé',
  Negociation = 'Négociation'   // Nouvel état
}


export class Devis {
    id: number;
    numdevis : string;
    projet: string;
    pieceJointe: string;
    etat: string = "En attente";
    commentaire: string;
    dateCreation: Date;
    archive: boolean;
    archiveU: boolean;
    cahierDesCharges: CahierDesCharges;
    user: User;
}
