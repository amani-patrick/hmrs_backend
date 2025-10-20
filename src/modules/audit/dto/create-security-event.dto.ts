import { IsString, IsNotEmpty, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SecurityEventType, SecuritySeverity } from '../entities/security-event.entity';

export class CreateSecurityEventDto {
  @ApiProperty({ enum: SecurityEventType, example: SecurityEventType.FAILED_LOGIN })
  @IsEnum(SecurityEventType)
  eventType: SecurityEventType;

  @ApiProperty({ enum: SecuritySeverity, example: SecuritySeverity.MEDIUM })
  @IsEnum(SecuritySeverity)
  severity: SecuritySeverity;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  ipAddress?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  userAgent?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  resource?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  action?: string;

  @ApiProperty({ example: 'Multiple failed login attempts detected' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional()
  @IsOptional()
  eventData?: Record<string, any>;

  @ApiProperty({ example: '2025-01-18T17:45:00Z' })
  @IsDateString()
  occurredAt: string;
}
