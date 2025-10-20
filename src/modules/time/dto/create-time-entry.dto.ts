import { IsString, IsOptional, IsDateString, IsNumber, IsIn } from 'class-validator';

export class CreateTimeEntryDto {
  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsIn(['Standard', 'Overtime', 'Remote'])
  type: string = 'Standard';
}
