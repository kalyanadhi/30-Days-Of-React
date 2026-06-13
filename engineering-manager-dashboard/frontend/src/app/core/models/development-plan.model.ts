import { GoalStatus } from './enums';

export interface DevelopmentPlan {
  id: string;
  employeeId: string;
  title: string;
  description: string | null;
  targetSkills: string | null;
  startDate: string;
  targetDate: string;
  status: GoalStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CreateDevelopmentPlanRequest = Omit<DevelopmentPlan, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateDevelopmentPlanRequest = Partial<CreateDevelopmentPlanRequest>;
