import { IsString, IsDateString, IsNumber, IsOptional, IsArray, IsEnum } from 'class-validator';

export class CreatePolicyDto {
  @IsString()
  title: string;

  @IsString()
  documentId: string;

  @IsString()
  @IsOptional()
  @IsEnum(['Draft', 'Active', 'Archived'])
  status?: string = 'Draft';

  @IsString()
  @IsOptional()
  version?: string = '1.0';

  @IsDateString()
  effectiveDate: Date;

  @IsDateString()
  @IsOptional()
  nextReviewDate?: Date;

  @IsNumber()
  requiredAcknowledgments: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  policyCode?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsArray()
  @IsOptional()
  applicableDepartments?: string[];
}
