import { TalentCategory } from '../common/enums';

type AxisLevel = 'LOW' | 'MEDIUM' | 'HIGH';

function getAxisLevel(score: number): AxisLevel {
  if (score <= 33) return 'LOW';
  if (score <= 66) return 'MEDIUM';
  return 'HIGH';
}

/**
 * Classifies an employee into a talent matrix category based on their
 * potential (X-axis) and performance (Y-axis) scores, each ranging 0-100.
 *
 *                   Potential: Low      Potential: Medium    Potential: High
 * Performance High  HIGH_PERFORMER      HIGH_PERFORMER       FUTURE_LEADER
 * Performance Med   CORE_CONTRIBUTOR    CORE_CONTRIBUTOR     EMERGING_TALENT
 * Performance Low   UNDERPERFORMER      UNDERPERFORMER       EMERGING_TALENT
 */
export function getTalentCategory(potentialScore: number, performanceScore: number): TalentCategory {
  const potential = getAxisLevel(potentialScore);
  const performance = getAxisLevel(performanceScore);

  if (performance === 'HIGH') {
    return potential === 'HIGH' ? TalentCategory.FUTURE_LEADER : TalentCategory.HIGH_PERFORMER;
  }

  if (performance === 'MEDIUM') {
    return potential === 'HIGH' ? TalentCategory.EMERGING_TALENT : TalentCategory.CORE_CONTRIBUTOR;
  }

  // performance === 'LOW'
  return potential === 'HIGH' ? TalentCategory.EMERGING_TALENT : TalentCategory.UNDERPERFORMER;
}
