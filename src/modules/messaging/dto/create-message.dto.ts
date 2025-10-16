import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { MessageType } from '../entities/message.entity';

class AttachmentDto {
  @IsString()
  type: string;

  @IsString()
  url: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsOptional()
  size?: number;

  @IsString()
  @IsOptional()
  mimeType?: string;
}

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(MessageType)
  @IsOptional()
  type?: MessageType = MessageType.TEXT;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  @IsOptional()
  attachments?: AttachmentDto[];

  @IsOptional()
  metadata?: Record<string, any>;

  @IsString()
  @IsOptional()
  parentMessageId?: string;
}
