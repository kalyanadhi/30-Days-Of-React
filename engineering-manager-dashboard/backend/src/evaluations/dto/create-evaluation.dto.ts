import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { EvaluationStatus, Quarter, RatingBand } from '../../common/enums';

export class CreateEvaluationDto {
  @IsString()
  employeeId: string;

  @IsEnum(Quarter)
  quarter: Quarter;

  @IsInt()
  @Min(2000)
  year: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  deliveryScore: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  technicalScore: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  qualityScore: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  collaborationScore: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  learningScore: number;

  @IsOptional()
  @IsString()
  managerFeedback?: string;

  @IsOptional()
  @IsString()
  employeeComments?: string;

  @IsOptional()
  @IsString()
  calibrationNotes?: string;

  @IsOptional()
  @IsEnum(RatingBand)
  finalRating?: RatingBand;

  @IsOptional()
  @IsEnum(EvaluationStatus)
  status?: EvaluationStatus;
}
