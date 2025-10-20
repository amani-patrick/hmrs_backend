import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CheckInMethod } from '../entities/attendance-record.entity';

export class CheckInDto {
  @ApiPropertyOptional({ enum: CheckInMethod, example: CheckInMethod.WEB })
  @IsEnum(CheckInMethod)
  @IsOptional()
  method?: CheckInMethod;

  @ApiPropertyOptional({ example: 'Office - Floor 3' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({ example: 'Early arrival' })
  @IsString()
  @IsOptional()
  notes?: string;
}
