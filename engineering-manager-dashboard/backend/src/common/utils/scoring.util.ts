import { PromotionReadinessBand, RatingBand } from '../enums';

/**
 * Weighting used to compute the overall performance score from the
 * five evaluation categories.
 */
export const CATEGORY_WEIGHTS = {
  delivery: 0.35,
  technical: 0.25,
  quality: 0.15,
  collaboration: 0.15,
  learning: 0.1,
} as const;

export interface CategoryScores {
  deliveryScore: number;
  technicalScore: number;
  qualityScore: number;
  collaborationScore: number;
  learningScore: number;
}

/**
 * Overall Score =
 *  (Delivery x 35%) + (Technical x 25%) + (Quality x 15%) +
 *  (Collaboration x 15%) + (Learning x 10%)
 */
export function calculateOverallScore(scores: CategoryScores): number {
  const overall =
    scores.deliveryScore * CATEGORY_WEIGHTS.delivery +
    scores.technicalScore * CATEGORY_WEIGHTS.technical +
    scores.qualityScore * CATEGORY_WEIGHTS.quality +
    scores.collaborationScore * CATEGORY_WEIGHTS.collaboration +
    scores.learningScore * CATEGORY_WEIGHTS.learning;

  return Math.round(overall * 100) / 100;
}

/**
 * Rating Bands:
 *  4.5 - 5.0  = Outstanding
 *  4.0 - 4.49 = Exceeds Expectations
 *  3.0 - 3.99 = Meets Expectations
 *  2.0 - 2.99 = Needs Improvement
 *  Below 2.0  = Unsatisfactory
 */
export function getRatingBand(overallScore: number): RatingBand {
  if (overallScore >= 4.5) return RatingBand.OUTSTANDING;
  if (overallScore >= 4.0) return RatingBand.EXCEEDS_EXPECTATIONS;
  if (overallScore >= 3.0) return RatingBand.MEETS_EXPECTATIONS;
  if (overallScore >= 2.0) return RatingBand.NEEDS_IMPROVEMENT;
  return RatingBand.UNSATISFACTORY;
}

/**
 * Promotion Readiness Bands:
 *  0-40   = Not Ready
 *  41-70  = Developing
 *  71-85  = Near Ready
 *  86-100 = Promotion Ready
 */
export function getPromotionReadinessBand(percentage: number): PromotionReadinessBand {
  if (percentage >= 86) return PromotionReadinessBand.PROMOTION_READY;
  if (percentage >= 71) return PromotionReadinessBand.NEAR_READY;
  if (percentage >= 41) return PromotionReadinessBand.DEVELOPING;
  return PromotionReadinessBand.NOT_READY;
}

/**
 * Average of the six promotion readiness dimensions (each scored 0-100).
 */
export function calculateReadinessPercentage(dimensions: {
  technicalCapability: number;
  leadership: number;
  ownership: number;
  delivery: number;
  influence: number;
  communication: number;
}): number {
  const total =
    dimensions.technicalCapability +
    dimensions.leadership +
    dimensions.ownership +
    dimensions.delivery +
    dimensions.influence +
    dimensions.communication;

  return Math.round((total / 6) * 100) / 100;
}
