import { User } from '../auth.models';

export interface CdcFile {
  id: number;
  nomFichier: string;
  chemin: string;
}

export enum EtatCahier {
  EnAttente = 'En attente',
  ACompleter = 'À compléter',
  Accepte = 'Accepté',
  Refuse = 'Refusé',
}


export interface CahierDesCharges {
  id?: number;
  titre: string;
  description?: string;
  files?: CdcFile[];     // correction ici : tableau de fichiers
  commentaire?: string;
  etat?: string;
  archive?: boolean;
  archiveU?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  user: User;
}
