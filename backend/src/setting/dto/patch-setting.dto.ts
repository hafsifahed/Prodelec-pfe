import { ArrayUnique, IsArray, IsEmail, IsNumber, IsOptional } from 'class-validator';

export class PatchSettingDto {
  @IsOptional()
  @IsNumber()
  reclamationTarget?: number;

   @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsEmail({}, { each: true })
  reclamationEmails?: string[];

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsEmail({}, { each: true })
  avisEmails?: string[];

   @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsEmail({}, { each: true })
  devisEmails?: string[];

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsEmail({}, { each: true })
  cahierDesChargesEmails?: string[];

    @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsEmail({}, { each: true })
  globalEmails?: string[];
}
