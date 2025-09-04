// src/reclamation/dto/update-reclamation.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ReclamationStatus } from '../enums/reclamation-status.enum';
import { CreateReclamationDto } from './create-reclamation.dto';

export class UpdateReclamationDto extends PartialType(CreateReclamationDto) {
  @IsString()
  @IsOptional()
  Reponse?: string;

  @IsEnum(ReclamationStatus, { message: 'Status must be En cours, Traité, or Clos' })
  @IsOptional()
  status?: ReclamationStatus;
}
