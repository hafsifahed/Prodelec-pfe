import { IsOptional, IsString } from 'class-validator';

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
  accountStatus?: string;

  @IsOptional()
  @IsString()
  name?: string;
}
