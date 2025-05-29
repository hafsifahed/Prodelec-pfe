import { User } from '../auth.models';

export interface CahierDesCharges {
  id?: number;
  titre: string;
  description?: string;
  pieceJointe?: string;
  commentaire?: string;
  etat?: string;
  archive?: boolean;
  archiveU?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  user: User;
}
