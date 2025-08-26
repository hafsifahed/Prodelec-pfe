import { IsNumber, IsOptional, IsString } from 'class-validator';
import { User } from '../../users/entities/users.entity';

export class CreateAvisDto {
  @IsOptional() @IsString() conformiteExigences?: string;
  @IsOptional() @IsString() reactiviteTechnique?: string;
  @IsOptional() @IsString() reactiviteReclamations?: string;
  @IsOptional() @IsString() reactiviteOffres?: string;
  @IsOptional() @IsString() conformiteBesoins?: string;
  @IsOptional() @IsString() documentationProduit?: string;
  @IsOptional() @IsString() evolutionsTechnologiques?: string;
  @IsOptional() @IsString() performanceEtude?: string;
  @IsOptional() @IsString() conformiteProduit?: string;
  @IsOptional() @IsString() respectLivraison?: string;
  @IsOptional() @IsString() respectSpecifications?: string;
  @IsOptional() @IsString() accueilTelephonique?: string;
  @IsOptional() @IsString() qualiteRelationnelle?: string;
  @IsOptional() @IsString() qualiteSite?: string;
  @IsOptional() @IsString() pointFort?: string;
  @IsOptional() @IsString() nomPrenom?: string;
  @IsOptional() @IsString() visa?: string;
  @IsOptional() @IsNumber() avg?: number;
  @IsOptional() @IsString() reactivite?: string;
  @IsOptional() @IsString() delaisintervention?: string;
  @IsOptional() @IsString() gammeproduits?: string;
  @IsOptional() @IsString() clartesimplicite?: string;
  @IsOptional() @IsString() delaidereponse?: string;
  @IsOptional() @IsString() deviscomm?: string;
  @IsOptional() @IsString() reactivitecomm?: string;
  @IsOptional() @IsString() develocomm?: string;
  @IsOptional() @IsString() presentationcomm?: string;
  @IsOptional() @IsString() savcomm?: string;
  @IsOptional() @IsString() elementcomm?: string;
  @IsOptional() @IsString() pointFort1?: string;
  @IsOptional() @IsString() pointFort2?: string;
  @IsOptional() @IsString() pointFort3?: string;
  @IsOptional() @IsString() pointFort4?: string;
  @IsOptional() @IsString() pointFort5?: string;
  @IsOptional() @IsString() pointFaible1?: string;
  @IsOptional() @IsString() pointFaible2?: string;
  @IsOptional() @IsString() pointFaible3?: string;
  @IsOptional() @IsString() pointFaible4?: string;
  @IsOptional() @IsString() pointFaible5?: string;
  @IsOptional() user?: User; // for linking to user
}
