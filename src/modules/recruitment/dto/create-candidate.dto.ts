import { IsString, IsNotEmpty, IsEmail, IsOptional, IsUUID, IsInt, Min } from 'class-validator';

export class CreateCandidateDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsInt()
  @Min(0)
  yearsOfExperience: number;

  @IsUUID()
  @IsNotEmpty()
  jobPostingId: string;

  @IsString()
  @IsOptional()
  resumeUrl?: string;

  @IsString()
  @IsOptional()
  coverLetter?: string;
}
