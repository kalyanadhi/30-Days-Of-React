import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { AchievementCategory } from '../../common/enums';

export class CreateAchievementDto {
  @IsString()
  employeeId: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  impact?: string;

  @IsOptional()
  @IsString()
  evidenceUrl?: string;

  @IsEnum(AchievementCategory)
  category: AchievementCategory;
}
