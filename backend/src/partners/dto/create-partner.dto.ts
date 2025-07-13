import { IsOptional, IsString } from 'class-validator';

export class CreatePartnerDto {
  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsString()
  tel: string;

  @IsOptional()
  image?: string;
}
