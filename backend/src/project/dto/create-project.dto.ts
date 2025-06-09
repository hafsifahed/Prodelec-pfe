import {
    IsBoolean,
    IsDateString,
    IsInt,
    IsNumber,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';

export class CreateProjectDto {
  // ---------- Infos générales ----------
  @IsOptional() @IsString()
  refClient?: string;

  @IsOptional() @IsString()
  refProdelec?: string;

  @IsOptional() @IsInt() @Min(0)
  qte?: number;

  @IsOptional() @IsDateString()
  dlp?: string;          // ← string ISO

  @IsOptional() @IsInt() @Min(0)
  duree?: number;

  @IsOptional() @IsBoolean()
  archivera?: boolean;

  @IsOptional() @IsBoolean()
  archiverc?: boolean;

  @IsOptional() @IsNumber()
  progress?: number;

  // ---------- Conception ----------
  @IsOptional() @IsInt()
  conceptionResponsibleId?: number;

  @IsOptional() @IsString()
  conceptionComment?: string;

  @IsOptional() @IsInt() @Min(0)
  conceptionDuration?: number;

  @IsOptional() @IsDateString()
  startConception?: string;

  @IsOptional() @IsDateString()
  endConception?: string;

  // ---------- Méthode ----------
  @IsOptional() @IsInt()
  methodeResponsibleId?: number;

  @IsOptional() @IsString()
  methodeComment?: string;

  @IsOptional() @IsInt() @Min(0)
  methodeDuration?: number;

  @IsOptional() @IsDateString()
  startMethode?: string;

  @IsOptional() @IsDateString()
  endMethode?: string;

  // ---------- Production ----------
  @IsOptional() @IsInt()
  productionResponsibleId?: number;

  @IsOptional() @IsString()
  productionComment?: string;

  @IsOptional() @IsInt() @Min(0)
  productionDuration?: number;

  @IsOptional() @IsDateString()
  startProduction?: string;

  @IsOptional() @IsDateString()
  endProduction?: string;

  // ---------- Contrôle final ----------
  @IsOptional() @IsInt()
  finalControlResponsibleId?: number;

  @IsOptional() @IsString()
  finalControlComment?: string;

  @IsOptional() @IsInt() @Min(0)
  finalControlDuration?: number;

  @IsOptional() @IsDateString()
  startFc?: string;

  @IsOptional() @IsDateString()
  endFc?: string;

  // ---------- Livraison ----------
  @IsOptional() @IsInt()
  deliveryResponsibleId?: number;

  @IsOptional() @IsString()
  deliveryComment?: string;

  @IsOptional() @IsInt() @Min(0)
  deliveryDuration?: number;

  @IsOptional() @IsDateString()
  startDelivery?: string;

  @IsOptional() @IsDateString()
  endDelivery?: string;
}
