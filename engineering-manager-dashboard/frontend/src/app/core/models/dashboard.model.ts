import { RatingBand } from './enums';

export interface DashboardSummary {
  totalTeamMembers: number;
  highPerformers: number;
  promotionReady: number;
  employeesAtRisk: number;
  averageTeamRating: number;
  openDevelopmentPlans: number;
  upcomingReviews: number;
}

export interface RatingDistributionItem {
  band: RatingBand;
  count: number;
}

export interface PerformanceTrendItem {
  period: string;
  averageScore: number;
}

export interface PromotionReadinessDistributionItem {
  band: string;
  count: number;
}

export interface SkillMatrixItem {
  category: string;
  averageScore: number;
}

export interface ExperienceDistributionItem {
  range: string;
  count: number;
}

export interface DashboardDistributions {
  ratingDistribution: RatingDistributionItem[];
  performanceTrend: PerformanceTrendItem[];
  promotionReadiness: PromotionReadinessDistributionItem[];
  skillMatrix: SkillMatrixItem[];
  experienceDistribution: ExperienceDistributionItem[];
}
