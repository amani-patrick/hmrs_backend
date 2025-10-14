import { IsEmail, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { Role } from '../../../common/enums/roles.enum';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role; 
}

// Complete a signup 
export class CompleteSignupDto {
    @IsNotEmpty()
    firstName: string;

    @IsNotEmpty()
    lastName: string;


  @IsNotEmpty()
  password: string;
  
  @IsOptional()
  Emergency_contact: string;

  @IsNotEmpty()
  phoneNumber: number;

  @IsNotEmpty()
  Address: string;

  @IsNotEmpty()
  dob: string;

  @IsNotEmpty()
  position: string;

  @IsOptional()
  skills: string[];

  @IsOptional()
  bio?: string;
}