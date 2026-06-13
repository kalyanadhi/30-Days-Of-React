import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { GoalPriority, GoalStatus } from '../../common/enums';

export class CreateGoalDto {
  @IsString()
  employeeId: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  dueDate: string;

  @IsEnum(GoalPriority)
  priority: GoalPriority;

  @IsNumber()
  @Min(0)
  @Max(100)
  weight: number;

  @IsOptional()
  @IsEnum(GoalStatus)
  status?: GoalStatus;
}
