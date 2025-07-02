import { IsNumber, IsOptional } from 'class-validator';

export class PatchSettingDto {
  @IsOptional()
  @IsNumber()
  reclamationTarget?: number;
}
