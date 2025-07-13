// src/users/dto/update-user-full.dto.ts
import { IsEmail, IsEnum, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';
import { AccountStatus } from '../enums/account-status.enum';

export class UpdateUserFullDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsOptional()
  image: string;

  @IsInt()
  @IsPositive()
  @IsOptional()
  roleId?: number;

  @IsInt()
  @IsPositive()
  @IsOptional()
  partnerId?: number;

  @IsEnum(AccountStatus)
  @IsOptional()
  accountStatus?: AccountStatus;
}
