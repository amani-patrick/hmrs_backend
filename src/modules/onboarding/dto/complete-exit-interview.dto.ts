import { IsString, IsNumber, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CompleteExitInterviewDto {
  @ApiProperty({ description: 'Exit interview notes' })
  @IsString()
  notes: string;

  @ApiProperty({ description: 'Overall rating (1-5)', minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ description: 'Would company rehire this employee' })
  @IsBoolean()
  wouldRehire: boolean;
}
