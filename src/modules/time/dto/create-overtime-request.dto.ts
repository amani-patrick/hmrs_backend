import { IsDateString, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateOvertimeRequestDto {
  @IsDateString()
  startTime: Date;

  @IsDateString()
  endTime: Date;

  @IsNumber()
  @Min(0.5)
  hoursRequested: number;

  @IsString()
  reason: string;

  @IsString()
  @IsOptional()
  projectId?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
