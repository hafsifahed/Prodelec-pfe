// src/reclamation/dto/process-reclamation.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class ProcessReclamationDto {
  @IsString()
  @IsNotEmpty()
  reponse: string;
}
