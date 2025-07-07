import { User } from "../auth.models";

export class Order {
  idOrder!: number;
  orderName!: string;
  attachementName!: string;
  quoteNumber!: string;
  annuler!: boolean;
  archivera!: boolean;
  user!: User;
  archiverc!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}
