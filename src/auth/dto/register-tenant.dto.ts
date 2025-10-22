import { IsEmail, IsNotEmpty, MinLength, IsString, Matches, IsOptional, IsNumber } from 'class-validator';
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

  @ApiProperty({ 
    example: 'John',
    description: 'Admin first name'
  })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ 
    example: 'Doe',
    description: 'Admin last name'
  })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({ 
    example: 'Technology',
    description: 'Company industry',
    required: false
  })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiProperty({ 
    example: '123 Business St, City, Country',
    description: 'Company address',
    required: false
  })
  @IsOptional()
  @IsString()
  companyAddress?: string;

  @ApiProperty({ 
    example: '+1234567890',
    description: 'Company phone number',
    required: false
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ 
    example: 'acme',
    description: 'Company domain/subdomain',
    required: false
  })
  @IsOptional()
  @IsString()
  companyDomain?: string;

  @ApiProperty({ 
    example: 50,
    description: 'Maximum number of employees',
    required: false
  })
  @IsOptional()
  @IsNumber()
  maxEmployees?: number;

  @ApiProperty({ 
    example: 'Professional',
    description: 'Subscription plan (Basic, Professional, Enterprise)',
    required: true
  })
  @IsNotEmpty()
  @IsString()
  subscriptionPlan: string;

  @ApiProperty({ 
    example: 'monthly',
    description: 'Billing cycle (monthly, yearly)',
    required: false
  })
  @IsOptional()
  @IsString()
  billingCycle?: string;
}