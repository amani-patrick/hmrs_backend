import { IsString, IsOptional } from 'class-validator';

export class AcknowledgePolicyDto {
  @IsString()
  @IsOptional()
  comments?: string;

  // These will be set by the controller
  ipAddress?: string;
  userAgent?: string;
}
