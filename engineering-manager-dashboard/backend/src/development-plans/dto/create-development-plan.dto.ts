import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { GoalStatus } from '../../common/enums';

export class CreateDevelopmentPlanDto {
  @IsString()
  employeeId: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  targetSkills?: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  targetDate: string;

  @IsOptional()
  @IsEnum(GoalStatus)
  status?: GoalStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
