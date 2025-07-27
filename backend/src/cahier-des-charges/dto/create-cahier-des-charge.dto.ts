import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { User } from '../../users/entities/users.entity';

export class CreateCahierDesChargesDto {
  @IsNotEmpty()
  @IsString()
  titre: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  files?: string[];

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
  user: User;

  @IsOptional()
  @IsArray()
  fileNames?: string[];
}
