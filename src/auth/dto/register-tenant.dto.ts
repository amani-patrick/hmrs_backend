import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterTenantDto {
  @IsNotEmpty()
  Name: string; 

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  password: string;
}