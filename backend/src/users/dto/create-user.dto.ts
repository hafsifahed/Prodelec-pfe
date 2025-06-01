import {
  ArrayNotEmpty,
  ArrayUnique,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MinLength
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsInt()
  @IsPositive()
  roleId: number;

  @IsInt()
  @IsPositive()
  @IsOptional()
  partnerId: number;

  @IsOptional()
  @ArrayUnique()
  @ArrayNotEmpty()
  permissions?: string[];
}
