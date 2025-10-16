import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { InterviewStatus, InterviewType } from '../entities/interview.entity';

export class CreateInterviewDto {
  @ApiProperty({ description: 'ID of the candidate being interviewed' })
  @IsUUID()
  @IsNotEmpty()
  candidateId: string;

  @ApiProperty({ description: 'ID of the interviewer' })
  @IsUUID()
  @IsNotEmpty()
  interviewerId: string;

  @ApiProperty({ description: 'Scheduled date and time for the interview' })
  @IsDateString()
  @IsNotEmpty()
  scheduledAt: Date;

  @ApiProperty({ description: 'Duration of the interview in minutes', default: 60 })
  @IsOptional()
  durationMinutes?: number;

  @ApiProperty({ 
    enum: InterviewType, 
    enumName: 'InterviewType',
    default: InterviewType.TECHNICAL 
  })
  @IsEnum(InterviewType)
  @IsOptional()
  type?: InterviewType;

  @ApiProperty({ description: 'Location of the interview (if in-person)', required: false })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ description: 'Meeting URL (if virtual)', required: false })
  @IsString()
  @IsOptional()
  meetingUrl?: string;

  @ApiProperty({ description: 'Additional notes about the interview', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateInterviewDto {
  @ApiProperty({ description: 'New scheduled date and time', required: false })
  @IsDateString()
  @IsOptional()
  scheduledAt?: Date;

  @ApiProperty({ description: 'New status of the interview', enum: InterviewStatus, required: false })
  @IsEnum(InterviewStatus)
  @IsOptional()
  status?: InterviewStatus;

  @ApiProperty({ description: 'New interview type', enum: InterviewType, required: false })
  @IsEnum(InterviewType)
  @IsOptional()
  type?: InterviewType;

  @ApiProperty({ description: 'New location', required: false })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ description: 'New meeting URL', required: false })
  @IsString()
  @IsOptional()
  meetingUrl?: string;

  @ApiProperty({ description: 'New duration in minutes', required: false })
  @IsOptional()
  durationMinutes?: number;

  @ApiProperty({ description: 'Interview feedback', required: false })
  @IsOptional()
  feedback?: {
    rating?: number;
    notes?: string;
    strengths?: string[];
    areasForImprovement?: string[];
    recommendedNextSteps?: string[];
  };
}

export class InterviewResponseDto {
  @ApiProperty({ description: 'Interview ID' })
  id: string;

  @ApiProperty({ description: 'Scheduled date and time' })
  scheduledAt: Date;

  @ApiProperty({ enum: InterviewStatus })
  status: InterviewStatus;

  @ApiProperty({ enum: InterviewType })
  type: InterviewType;

  @ApiProperty({ description: 'Interview duration in minutes' })
  durationMinutes: number;

  @ApiProperty({ required: false })
  location?: string;

  @ApiProperty({ required: false })
  meetingUrl?: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ description: 'Interview feedback', required: false })
  feedback?: {
    rating?: number;
    notes?: string;
    strengths?: string[];
    areasForImprovement?: string[];
    recommendedNextSteps?: string[];
  };

  @ApiProperty({ description: 'Candidate ID' })
  candidateId: string;

  @ApiProperty({ description: 'Candidate name' })
  candidateName: string;

  @ApiProperty({ description: 'Job title' })
  jobTitle: string;

  @ApiProperty({ description: 'Interviewer ID' })
  interviewerId: string;

  @ApiProperty({ description: 'Interviewer name' })
  interviewerName: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  completedAt?: Date;
}
