import { IsArray, IsEnum, IsOptional, IsString, IsUUID, MaxLength, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ConversationType } from '../entities/conversation.entity';

export class ParticipantDto {
  @IsUUID()
  userId: string;

  @IsString()
  @IsOptional()
  role?: string;
}

export class CreateConversationDto {
  @IsEnum(ConversationType)
  type: ConversationType;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(255)
  name?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParticipantDto)
  participants: ParticipantDto[];

  @IsString()
  @IsOptional()
  @MaxLength(500)
  avatarUrl?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}
