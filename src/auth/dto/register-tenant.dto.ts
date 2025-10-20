import { IsEmail, IsNotEmpty, MinLength, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterTenantDto {
  @ApiProperty({ 
    example: 'Acme Corporation',
    description: 'Company/Organization name'
  })
  @IsNotEmpty()
  @IsString()
  Name: string; 

  @ApiProperty({ 
    example: 'admin@acme.com',
    description: 'Admin user email'
  })
  @IsEmail()
  email: string;

  @ApiProperty({ 
    example: 'SecurePass123!',
    description: 'Password (min 8 characters, must contain uppercase, lowercase, number)',
    minLength: 8
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password must contain uppercase, lowercase, and number/special character',
  })
  password: string;
}