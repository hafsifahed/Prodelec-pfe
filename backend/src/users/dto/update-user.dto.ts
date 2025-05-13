// src/users/dto/update-user.dto.ts
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;
}

// src/users/dto/account-status.dto.ts
import { IsEnum } from 'class-validator';
import { AccountStatus } from '../enums/account-status.enum';

export class AccountStatusDto {
  @IsEnum(AccountStatus)
  status: AccountStatus;
}
