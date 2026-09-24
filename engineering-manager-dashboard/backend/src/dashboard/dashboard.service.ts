import { Injectable } from '@nestjs/common';
import { EmployeesService } from '../employees/employees.service';
import { EvaluationsService } from '../evaluations/evaluations.service';
import { PromotionReadinessService } from '../promotion-readiness/promotion-readiness.service';
import { RiskService } from '../risk/risk.service';
import { DevelopmentPlansService } from '../development-plans/development-plans.service';
import { CATEGORY_WEIGHTS } from '../common/utils/scoring.util';
import { GoalStatus, Quarter, RatingBand, RiskLevel } from '../common/enums';

const QUARTER_ORDER: Record<Quarter, number> = {
  [Quarter.Q1]: 1,
  [Quarter.Q2]: 2,
  [Quarter.Q3]: 3,
  [Quarter.Q4]: 4,
};

function getCurrentQuarter(): Quarter {
  const month = new Date().getMonth(); // 0-11
  const quarterIndex = Math.floor(month / 3) + 1;
  return (`Q${quarterIndex}` as Quarter);
}

@Injectable()
export class DashboardService {
  constructor(
    private readonly employeesService: EmployeesService,
    private readonly evaluationsService: EvaluationsService,
    private readonly promotionReadinessService: PromotionReadinessService,
    private readonly riskService: RiskService,
    private readonly developmentPlansService: DevelopmentPlansService,
  ) {}

  async getSummary() {
    const employees = await this.employeesService.findAll();
    const employeeIds = employees.map((employee) => employee.id);

    const [latestEvaluations, promotionDashboard, riskHeatmap, developmentPlans] = await Promise.all([
      this.evaluationsService.getLatestForEmployees(employeeIds),
      this.promotionReadinessService.getDashboard(),
      this.riskService.getHeatmap(),
      this.developmentPlansService.findAll(),
    ]);

    const evaluationScores = Array.from(latestEvaluations.values()).map((e) => Number(e.overallScore));

    const highPerformers = Array.from(latestEvaluations.values()).filter((e) =>
      [RatingBand.OUTSTANDING, RatingBand.EXCEEDS_EXPECTATIONS].includes(e.ratingBand),
    ).length;

    const averageTeamRating = evaluationScores.length
      ? Math.round((evaluationScores.reduce((sum, score) => sum + score, 0) / evaluationScores.length) * 100) / 100
      : 0;

    const employeesAtRisk = riskHeatmap.items.filter(({ assessment }) =>
      [assessment.attritionRisk, assessment.burnoutRisk, assessment.skillGapRisk, assessment.performanceRisk].includes(
        RiskLevel.HIGH,
      ),
    ).length;

    const openDevelopmentPlans = developmentPlans.filter((plan) => plan.status !== GoalStatus.COMPLETED).length;

    const currentQuarter = getCurrentQuarter();
    const currentYear = new Date().getFullYear();
    const upcomingReviews = employees.filter((employee) => {
      const latest = latestEvaluations.get(employee.id);
      return !latest || latest.year !== currentYear || latest.quarter !== currentQuarter;
    }).length;

    return {
      totalTeamMembers: employees.length,
      highPerformers,
      promotionReady: promotionDashboard.summary.promotionReady,
      employeesAtRisk,
      averageTeamRating,
      openDevelopmentPlans,
      upcomingReviews,
    };
  }

  async getDistributions() {
    const employees = await this.employeesService.findAll();
    const employeeIds = employees.map((employee) => employee.id);

    const [latestEvaluations, allEvaluations, promotionDashboard] = await Promise.all([
      this.evaluationsService.getLatestForEmployees(employeeIds),
      this.evaluationsService.getAllForEmployees(employeeIds),
      this.promotionReadinessService.getDashboard(),
    ]);

    return {
      ratingDistribution: this.buildRatingDistribution(latestEvaluations),
      performanceTrend: this.buildPerformanceTrend(allEvaluations),
      promotionReadiness: [
        { band: 'Not Ready', count: promotionDashboard.summary.notReady },
        { band: 'Developing', count: promotionDashboard.summary.developing },
        { band: 'Near Ready', count: promotionDashboard.summary.nearReady },
        { band: 'Promotion Ready', count: promotionDashboard.summary.promotionReady },
      ],
      skillMatrix: this.buildSkillMatrix(latestEvaluations),
      experienceDistribution: this.buildExperienceDistribution(employees),
    };
  }

  private buildRatingDistribution(latestEvaluations: Map<string, { ratingBand: RatingBand }>) {
    const bands = Object.values(RatingBand);
    const counts = new Map<RatingBand, number>(bands.map((band) => [band, 0]));

    for (const evaluation of latestEvaluations.values()) {
      counts.set(evaluation.ratingBand, (counts.get(evaluation.ratingBand) ?? 0) + 1);
    }

    return bands.map((band) => ({ band, count: counts.get(band) ?? 0 }));
  }

  private buildPerformanceTrend(
    evaluations: Array<{ year: number; quarter: Quarter; overallScore: number }>,
  ) {
    const grouped = new Map<string, { year: number; quarter: Quarter; total: number; count: number }>();

    for (const evaluation of evaluations) {
      const key = `${evaluation.year}-${evaluation.quarter}`;
      const entry = grouped.get(key) ?? {
        year: evaluation.year,
        quarter: evaluation.quarter,
        total: 0,
        count: 0,
      };
      entry.total += Number(evaluation.overallScore);
      entry.count += 1;
      grouped.set(key, entry);
    }

    return Array.from(grouped.values())
      .sort((a, b) => (a.year - b.year) || (QUARTER_ORDER[a.quarter] - QUARTER_ORDER[b.quarter]))
      .map((entry) => ({
        period: `${entry.year} ${entry.quarter}`,
        averageScore: Math.round((entry.total / entry.count) * 100) / 100,
      }));
  }

  private buildSkillMatrix(
    latestEvaluations: Map<
      string,
      {
        deliveryScore: number;
        technicalScore: number;
        qualityScore: number;
        collaborationScore: number;
        learningScore: number;
      }
    >,
  ) {
    const categories: Array<{ key: keyof typeof CATEGORY_WEIGHTS; label: string }> = [
      { key: 'delivery', label: 'Delivery Excellence' },
      { key: 'technical', label: 'Technical Excellence' },
      { key: 'quality', label: 'Quality Ownership' },
      { key: 'collaboration', label: 'Collaboration & Communication' },
      { key: 'learning', label: 'Learning & Innovation' },
    ];

    const fieldByCategory: Record<string, string> = {
      delivery: 'deliveryScore',
      technical: 'technicalScore',
      quality: 'qualityScore',
      collaboration: 'collaborationScore',
      learning: 'learningScore',
    };

    const evaluations = Array.from(latestEvaluations.values());

    return categories.map(({ key, label }) => {
      const field = fieldByCategory[key] as keyof (typeof evaluations)[number];
      const total = evaluations.reduce((sum, evaluation) => sum + Number(evaluation[field]), 0);
      const average = evaluations.length ? Math.round((total / evaluations.length) * 100) / 100 : 0;

      return { category: label, averageScore: average };
    });
  }

  private buildExperienceDistribution(employees: Array<{ totalExperienceYears: number }>) {
    const buckets = [
      { range: '0-2 yrs', min: 0, max: 2 },
      { range: '2-5 yrs', min: 2, max: 5 },
      { range: '5-8 yrs', min: 5, max: 8 },
      { range: '8-12 yrs', min: 8, max: 12 },
      { range: '12+ yrs', min: 12, max: Infinity },
    ];

    return buckets.map(({ range, min, max }) => ({
      range,
      count: employees.filter((employee) => {
        const years = Number(employee.totalExperienceYears);
        return years >= min && years < max;
      }).length,
    }));
  }
}
