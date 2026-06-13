import { AchievementCategory } from './enums';

export interface Achievement {
  id: string;
  employeeId: string;
  title: string;
  description: string | null;
  date: string;
  impact: string | null;
  evidenceUrl: string | null;
  category: AchievementCategory;
  createdAt: string;
  updatedAt: string;
}

export type CreateAchievementRequest = Omit<Achievement, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateAchievementRequest = Partial<CreateAchievementRequest>;
