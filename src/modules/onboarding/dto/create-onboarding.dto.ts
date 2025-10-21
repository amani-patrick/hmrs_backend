import { IsString, IsNotEmpty, IsDateString, IsOptional, IsArray, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOnboardingDto {
  @ApiProperty({ example: 'employee-uuid' })
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  employeeName: string;

  @ApiProperty({ example: 'Software Engineer' })
  @IsString()
  @IsNotEmpty()
  position: string;

  @ApiProperty({ example: 'Engineering' })
  @IsString()
  @IsNotEmpty()
  department: string;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({ example: 'hr-manager-uuid' })
  @IsString()
  @IsOptional()
  assignedHR?: string;

  @ApiPropertyOptional({ example: 'buddy-uuid' })
  @IsString()
  @IsOptional()
  assignedBuddy?: string;

  @ApiPropertyOptional({ example: 'manager-uuid' })
  @IsString()
  @IsOptional()
  manager?: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  equipmentAssigned?: {
    itemName: string;
    serialNumber?: string;
  }[];

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  documentsRequired?: string[];
}
