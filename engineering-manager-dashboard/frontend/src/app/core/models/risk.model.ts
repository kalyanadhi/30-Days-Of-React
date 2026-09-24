import { RiskLevel } from './enums';

export interface RiskAssessment {
  id: string;
  employeeId: string;
  attritionRisk: RiskLevel;
  burnoutRisk: RiskLevel;
  skillGapRisk: RiskLevel;
  performanceRisk: RiskLevel;
  notes: string | null;
  assessmentDate: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateRiskAssessmentRequest = Omit<RiskAssessment, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateRiskAssessmentRequest = Partial<CreateRiskAssessmentRequest>;

export interface RiskCounts {
  low: number;
  medium: number;
  high: number;
}

export interface RiskHeatmap {
  items: Array<{
    employee: { id: string; fullName: string; designation: string; department: string };
    assessment: RiskAssessment;
  }>;
  summary: {
    attrition: RiskCounts;
    burnout: RiskCounts;
    skillGap: RiskCounts;
    performance: RiskCounts;
  };
}
