import { User } from "../auth.models";
import { Order } from "../order/order";

export class Project {
    idproject!: number;
    refClient!: string;
    refProdelec!: string;
    qte!: number;
    dlp!: Date;
    duree!: number;
    conceptionComment!: string;
    conceptionDuration!: number;
    conceptionStatus!: boolean;
    conceptionprogress!:number;
    methodeComment!: string;
    methodeDuration!: number;
    methodeStatus!: boolean;
    methodeprogress!:number;
    productionComment!: string;
    productionDuration!: number;
    productionStatus!: boolean;
    productionprogress!:number;
    finalControlComment!: string;
    finalControlDuration!: number;
    finalControlStatus!: boolean;
    fcprogress!:number;
    deliveryComment!: string;
    deliveryDuration!: number;
    deliveryStatus!: boolean;
    deliveryprogress!:number;
    progress:number;
    archivera!: boolean;
    archiverc!: boolean;
    startConception!: Date;
    endConception!: Date;
    startMethode!: Date;
    endMethode!: Date;
    startProduction!: Date;
    endProduction!: Date;
    startFc!: Date;
    endFc!: Date;
    startDelivery!: Date;
    endDelivery!: Date;
    realendDelivery!: Date;
    realendFc!: Date;
    realendProduction!: Date;
    realendMethode!: Date;
    realendConception!: Date;
    createdAt: Date;
    updatedAt: Date;
    order:Order;

    conceptionExist!: boolean;
  methodeExist!: boolean;
  productionExist!: boolean;
  finalControlExist!: boolean;
  deliveryExist!: boolean;

  conceptionResponsible!: User;
methodeResponsible!: User;
  productionResponsible!: User;
finalControlResponsible!: User;
  deliveryResponsible!: User;

}
