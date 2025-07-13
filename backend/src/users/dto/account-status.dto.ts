import { IsEnum } from 'class-validator';
import { AccountStatus } from '../enums/account-status.enum';

export class AccountStatusDto {
  @IsEnum(AccountStatus)
  status: AccountStatus;
}

