import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TypeReclamation } from '../enums/type-reclamation.enum';

export class CreateReclamationDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(TypeReclamation)
  type_de_defaut: TypeReclamation;

  @IsString()
  @IsOptional()
  PieceJointe?: string;
}
