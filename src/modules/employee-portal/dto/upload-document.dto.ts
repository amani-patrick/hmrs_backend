import { IsString, IsEnum, IsOptional, IsDateString, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentCategory } from '../entities/employee-document.entity';

export class UploadDocumentDto {
  @ApiProperty({ description: 'Document name' })
  @IsString()
  documentName: string;

  @ApiProperty({ enum: DocumentCategory, description: 'Document category' })
  @IsEnum(DocumentCategory)
  category: DocumentCategory;

  @ApiProperty({ description: 'File URL (after upload to storage)' })
  @IsString()
  fileUrl: string;

  @ApiProperty({ description: 'File name' })
  @IsString()
  fileName: string;

  @ApiProperty({ description: 'File size in bytes' })
  fileSize: number;

  @ApiProperty({ description: 'MIME type' })
  @IsString()
  mimeType: string;

  @ApiPropertyOptional({ description: 'Document description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Document number (ID, passport, etc.)' })
  @IsString()
  @IsOptional()
  documentNumber?: string;

  @ApiPropertyOptional({ description: 'Issue date' })
  @IsDateString()
  @IsOptional()
  issueDate?: Date;

  @ApiPropertyOptional({ description: 'Expiry date' })
  @IsDateString()
  @IsOptional()
  expiryDate?: Date;

  @ApiPropertyOptional({ description: 'Issuing authority' })
  @IsString()
  @IsOptional()
  issuingAuthority?: string;

  @ApiPropertyOptional({ description: 'Mark as confidential' })
  @IsBoolean()
  @IsOptional()
  isConfidential?: boolean;

  @ApiPropertyOptional({ description: 'Document tags', type: [String] })
  @IsArray()
  @IsOptional()
  tags?: string[];
}
