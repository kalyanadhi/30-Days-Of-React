import { GoalPriority, GoalStatus } from './enums';

export interface Goal {
  id: string;
  employeeId: string;
  title: string;
  description: string | null;
  dueDate: string;
  priority: GoalPriority;
  weight: number;
  progressPercentage: number;
  status: GoalStatus;
  completionDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CreateGoalRequest = Omit<
  Goal,
  'id' | 'progressPercentage' | 'completionDate' | 'createdAt' | 'updatedAt'
> & {
  progressPercentage?: number;
};

export type UpdateGoalRequest = Partial<Omit<Goal, 'id' | 'employeeId' | 'createdAt' | 'updatedAt'>>;
