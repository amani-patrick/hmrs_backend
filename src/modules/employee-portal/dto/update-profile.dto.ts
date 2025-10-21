import { IsString, IsOptional, IsObject, IsArray, IsBoolean, IsUrl, IsEmail } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ description: 'Personal information' })
  @IsObject()
  @IsOptional()
  personalInfo?: {
    dateOfBirth?: Date;
    gender?: string;
    maritalStatus?: string;
    nationality?: string;
    bloodGroup?: string;
  };

  @ApiPropertyOptional({ description: 'Contact information' })
  @IsObject()
  @IsOptional()
  contactInfo?: {
    personalEmail?: string;
    personalPhone?: string;
    alternatePhone?: string;
    address?: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  };

  @ApiPropertyOptional({ description: 'Emergency contacts', type: 'array' })
  @IsArray()
  @IsOptional()
  emergencyContacts?: Array<{
    name: string;
    relationship: string;
    phone: string;
    email?: string;
    isPrimary: boolean;
  }>;

  @ApiPropertyOptional({ description: 'Bank details' })
  @IsObject()
  @IsOptional()
  bankDetails?: {
    bankName?: string;
    accountNumber?: string;
    accountHolderName?: string;
    routingNumber?: string;
    swiftCode?: string;
  };

  @ApiPropertyOptional({ description: 'Tax information' })
  @IsObject()
  @IsOptional()
  taxInformation?: {
    taxId?: string;
    taxFilingStatus?: string;
    allowances?: number;
    additionalWithholding?: number;
  };

  @ApiPropertyOptional({ description: 'Dependents', type: 'array' })
  @IsArray()
  @IsOptional()
  dependents?: Array<{
    name: string;
    relationship: string;
    dateOfBirth: Date;
    isDependent: boolean;
  }>;

  @ApiPropertyOptional({ description: 'Education history', type: 'array' })
  @IsArray()
  @IsOptional()
  education?: Array<{
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: Date;
    endDate?: Date;
    gpa?: string;
  }>;

  @ApiPropertyOptional({ description: 'Certifications', type: 'array' })
  @IsArray()
  @IsOptional()
  certifications?: Array<{
    name: string;
    issuingOrganization: string;
    issueDate: Date;
    expiryDate?: Date;
    credentialId?: string;
  }>;

  @ApiPropertyOptional({ description: 'Languages', type: 'array' })
  @IsArray()
  @IsOptional()
  languages?: Array<{
    language: string;
    proficiency: 'basic' | 'intermediate' | 'fluent' | 'native';
  }>;

  @ApiPropertyOptional({ description: 'Skills', type: [String] })
  @IsArray()
  @IsOptional()
  skills?: string[];

  @ApiPropertyOptional({ description: 'Profile picture URL' })
  @IsUrl()
  @IsOptional()
  profilePictureUrl?: string;

  @ApiPropertyOptional({ description: 'Resume URL' })
  @IsUrl()
  @IsOptional()
  resumeUrl?: string;

  @ApiPropertyOptional({ description: 'Bio' })
  @IsString()
  @IsOptional()
  bio?: string;
}
