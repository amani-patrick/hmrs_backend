import { IsString, IsDateString, IsNumber, IsOptional, IsEnum, IsUUID } from 'class-validator';

export class CreateContractDto {
  @IsUUID()
  userId: string;

  @IsString()
  type: string; // e.g., 'Full-Time', 'Part-Time', 'Contractor'

  @IsString()
  @IsOptional()
  @IsEnum(['Draft', 'Active', 'Expired', 'Terminated'])
  status?: string = 'Draft';

  @IsNumber()
  salary: number;

  @IsString()
  @IsOptional()
  currency?: string = 'USD';

  @IsDateString()
  startDate: Date;

  @IsDateString()
  @IsOptional()
  endDate?: Date;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsUUID()
  @IsOptional()
  templateId?: string;

  @IsString()
  @IsOptional()
  version?: string = '1.0';

  @IsOptional()
  customFields?: Record<string, any>;
}
