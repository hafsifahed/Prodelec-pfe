import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCahierDesChargesDto {
  @IsNotEmpty()
  @IsString()
  titre: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  pieceJointe?: string;

  @IsOptional()
  @IsString()
  commentaire?: string;

  @IsOptional()
  @IsString()
  etat?: string;

  @IsOptional()
  @IsBoolean()
  archive?: boolean;

  @IsOptional()
  @IsBoolean()
  archiveU?: boolean;

  @IsNotEmpty()
  @IsNumber()
  userId: number;
}
