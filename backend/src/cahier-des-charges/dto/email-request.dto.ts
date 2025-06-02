import { ArrayNotEmpty, IsArray, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class EmailRequestDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsEmail({}, { each: true })
  to: string[];

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  text: string;
}
