import { LearningCompletionStatus } from './enums';

export interface LearningActivity {
  id: string;
  employeeId: string;
  trainingName: string;
  certificationName: string | null;
  learningHours: number;
  completionStatus: LearningCompletionStatus;
  skillArea: string;
  completionDate: string | null;
  expiryDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CreateLearningActivityRequest = Omit<LearningActivity, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateLearningActivityRequest = Partial<CreateLearningActivityRequest>;
