import { PromotionReadinessBand } from './enums';

export interface PromotionReadiness {
  id: string;
  employeeId: string;
  technicalCapability: number;
  leadership: number;
  ownership: number;
  delivery: number;
  influence: number;
  communication: number;
  readinessPercentage: number;
  readinessBand: PromotionReadinessBand;
  assessmentDate: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CreatePromotionReadinessRequest = Omit<
  PromotionReadiness,
  'id' | 'readinessPercentage' | 'readinessBand' | 'createdAt' | 'updatedAt'
>;
export type UpdatePromotionReadinessRequest = Partial<CreatePromotionReadinessRequest>;

export interface PromotionReadinessDashboard {
  summary: {
    notReady: number;
    developing: number;
    nearReady: number;
    promotionReady: number;
  };
  items: Array<{
    employee: { id: string; fullName: string; designation: string; department: string };
    assessment: PromotionReadiness | null;
  }>;
}
