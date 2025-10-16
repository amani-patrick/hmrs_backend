import { IsString, IsNumber, IsOptional, IsArray, IsObject } from 'class-validator';

export class CreatePositionDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  minSalary?: number;

  @IsNumber()
  @IsOptional()
  maxSalary?: number;

  @IsString()
  departmentId: string;

  @IsObject()
  @IsOptional()
  keyRequirements?: Record<string, any>;

  @IsArray()
  @IsOptional()
  responsibilities?: string[];

  @IsObject()
  @IsOptional()
  details?: { tags: string[] };
}
