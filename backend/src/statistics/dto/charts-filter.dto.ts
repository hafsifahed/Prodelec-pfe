// src/statistics/dto/charts-filter.dto.ts
import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class ChartsFilterDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  partnerId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  userId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  year?: number;
}