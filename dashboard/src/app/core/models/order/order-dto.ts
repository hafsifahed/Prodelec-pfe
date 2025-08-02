import { Devis } from "../Devis/devis";

export interface OrderDto {
  orderName: string;
  attachementName: string;
  devis?: Devis;
}

