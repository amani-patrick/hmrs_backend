import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateMessageDto {
  @IsString()
  @IsOptional()
  content?: string;

  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean;

  @IsOptional()
  metadata?: Record<string, any>;
}
