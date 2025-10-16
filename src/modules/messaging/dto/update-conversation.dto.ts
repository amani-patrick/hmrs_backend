// src/modules/messaging/dto/update-conversation.dto.ts
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateConversationDto } from './create-conversation.dto';

export class UpdateConversationDto extends PartialType(CreateConversationDto) {
  @IsBoolean()
  @IsOptional()
  isArchived?: boolean;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  addParticipants?: string[];

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  removeParticipants?: string[];
}