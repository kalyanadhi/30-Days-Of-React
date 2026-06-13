import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { LearningCompletionStatus } from '../../common/enums';

export class CreateLearningActivityDto {
  @IsString()
  employeeId: string;

  @IsString()
  trainingName: string;

  @IsOptional()
  @IsString()
  certificationName?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  learningHours?: number;

  @IsOptional()
  @IsEnum(LearningCompletionStatus)
  completionStatus?: LearningCompletionStatus;

  @IsString()
  skillArea: string;

  @IsOptional()
  @IsString()
  completionDate?: string;

  @IsOptional()
  @IsString()
  expiryDate?: string;
}
