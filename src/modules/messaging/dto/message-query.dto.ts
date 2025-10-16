import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class MessageQueryDto {
  @IsString()
  @IsOptional()
  before?: string;

  @IsString()
  @IsOptional()
  after?: string;

  @IsString()
  @IsOptional()
  sortBy: string = 'createdAt';

  @IsString()
  @IsOptional()
  sortOrder: 'ASC' | 'DESC' = 'DESC';

  @IsString()
  @IsOptional()
  limit: number = 50;

  @IsBoolean()
  @IsOptional()
  includeDeleted: boolean = false;
}
