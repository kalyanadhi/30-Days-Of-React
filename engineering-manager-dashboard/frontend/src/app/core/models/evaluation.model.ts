import { EvaluationStatus, Quarter, RatingBand } from './enums';
import { Employee } from './employee.model';

export interface PerformanceEvaluation {
  id: string;
  employeeId: string;
  employee?: Employee;
  quarter: Quarter;
  year: number;
  deliveryScore: number;
  technicalScore: number;
  qualityScore: number;
  collaborationScore: number;
  learningScore: number;
  overallScore: number;
  ratingBand: RatingBand;
  managerFeedback: string | null;
  employeeComments: string | null;
  calibrationNotes: string | null;
  finalRating: RatingBand | null;
  status: EvaluationStatus;
  createdAt: string;
  updatedAt: string;
}

export type CreateEvaluationRequest = Omit<
  PerformanceEvaluation,
  'id' | 'employee' | 'overallScore' | 'ratingBand' | 'createdAt' | 'updatedAt'
>;

export type UpdateEvaluationRequest = Partial<CreateEvaluationRequest>;

export interface EvaluationTrend {
  latest: PerformanceEvaluation | null;
  previous: PerformanceEvaluation | null;
  trend: number;
}

export const CATEGORY_WEIGHTS = {
  deliveryScore: 0.35,
  technicalScore: 0.25,
  qualityScore: 0.15,
  collaborationScore: 0.15,
  learningScore: 0.1,
} as const;

export const CATEGORY_LABELS: Record<keyof typeof CATEGORY_WEIGHTS, string> = {
  deliveryScore: 'Delivery Excellence',
  technicalScore: 'Technical Excellence',
  qualityScore: 'Quality Ownership',
  collaborationScore: 'Collaboration & Communication',
  learningScore: 'Learning & Innovation',
};
