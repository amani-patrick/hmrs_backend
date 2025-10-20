import { IsString, IsNotEmpty, IsEnum, IsDateString, IsOptional, IsArray, IsNumber, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GoalType, GoalPriority } from '../entities/goal.entity';

export class CreateGoalDto {
  @ApiProperty({ example: 'owner-uuid' })
  @IsString()
  @IsNotEmpty()
  ownerId: string;

  @ApiProperty({ example: 'Increase sales by 20%' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Focus on new customer acquisition' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: GoalType, example: GoalType.INDIVIDUAL })
  @IsEnum(GoalType)
  type: GoalType;

  @ApiPropertyOptional({ enum: GoalPriority, default: GoalPriority.MEDIUM })
  @IsEnum(GoalPriority)
  @IsOptional()
  priority?: GoalPriority;

  @ApiProperty({ example: '2025-01-01' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2025-12-31' })
  @IsDateString()
  dueDate: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  keyResults?: Array<{
    id: string;
    description: string;
    target: number;
    current: number;
    unit: string;
    isAchieved: boolean;
  }>;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  milestones?: Array<{
    id: string;
    title: string;
    dueDate: string;
    isCompleted: boolean;
  }>;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  parentGoalId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  alignedGoalId?: string;

  @ApiPropertyOptional({ example: ['sales', 'q1'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ example: 10, description: 'Weight for scoring' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  weight?: number;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;
}
