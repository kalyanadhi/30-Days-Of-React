import { IsEnum, IsOptional, IsString } from 'class-validator';
import { RiskLevel } from '../../common/enums';

export class CreateRiskAssessmentDto {
  @IsString()
  employeeId: string;

  @IsEnum(RiskLevel)
  attritionRisk: RiskLevel;

  @IsEnum(RiskLevel)
  burnoutRisk: RiskLevel;

  @IsEnum(RiskLevel)
  skillGapRisk: RiskLevel;

  @IsEnum(RiskLevel)
  performanceRisk: RiskLevel;

  @IsString()
  assessmentDate: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
