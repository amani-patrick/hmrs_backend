import { IsString, IsOptional, IsBoolean, IsNumber, IsDateString, IsArray, IsEnum } from 'class-validator';

export class CreateDocumentDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  @IsEnum(['Draft', 'Published', 'Archived'])
  status?: string = 'Draft';

  @IsBoolean()
  @IsOptional()
  isTemplate?: boolean = false;

  @IsString()
  @IsOptional()
  templateCategory?: string;

  @IsDateString()
  @IsOptional()
  expiresOn?: Date;

  @IsArray()
  @IsOptional()
  accessRules?: any[];

  @IsString()
  @IsOptional()
  fileType?: string;

  @IsNumber()
  @IsOptional()
  fileSize?: number;
}
