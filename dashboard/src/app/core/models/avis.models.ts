import { User } from "./auth.models";

export class AvisModels {
    id: number;
    conformiteExigences: string;
    reactiviteTechnique: string;
    reactiviteReclamations: string;
    reactiviteOffres: string;
    conformiteBesoins: string;
    documentationProduit: string;
    evolutionsTechnologiques: string;
    performanceEtude: string;
    conformiteProduit: string;
    respectLivraison: string;
    respectSpecifications: string;
    accueilTelephonique: string;
    qualiteRelationnelle: string;
    qualiteSite: string;
    pointFort: string;
    nomPrenom: string;
    visa: string;
    avg:number;

    reactivite:string;
    delaisintervention:string;
    gammeproduits:string;
    clartesimplicite:string;
    delaidereponse:string;

    deviscomm:string;
    reactivitecomm:string;
    develocomm:string;
    presentationcomm:string;
    savcomm:string;
    elementcomm:string;

    pointFort1:string;
    pointFort2:string;
    pointFort3:string;
    pointFort4;
    pointFort5;

    pointFaible1:string;
    pointFaible2:string;
    pointFaible3:string;
    pointFaible4:string;
    pointFaible5:string;

    createdAt: Date;
    updatedAt: Date;
    user: User;
}