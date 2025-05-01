import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength
} from 'class-validator';
// import { IsUnique } from './validators/is-unique.validator'; // You need to implement this custom validator

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  // @Validate(IsUnique, ['User', 'username']) // Custom unique validator, see note below
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  // Add more password rules as needed (e.g., regex for complexity)
  password: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsNotEmpty()
  // @Validate(IsUnique, ['User', 'email']) // Custom unique validator, see note below
  email: string;

  @IsString()
  @IsOptional()
  name?: string;
}
