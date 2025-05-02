import { IsEnum, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';
import { AccountStatus } from '../enums/account-status.enum';

export class FindUsersDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsEnum(AccountStatus)
  @IsOptional()
  accountStatus?: AccountStatus; 

  @IsInt()
  @IsPositive()
  @IsOptional()
  roleId: number;
}
