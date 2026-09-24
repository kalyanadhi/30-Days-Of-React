import { BadRequestException, Injectable } from '@nestjs/common';
import { EmployeesService } from '../employees/employees.service';
import { EvaluationsService } from '../evaluations/evaluations.service';
import { PromotionReadinessService } from '../promotion-readiness/promotion-readiness.service';
import { TalentMatrixService } from '../talent-matrix/talent-matrix.service';
import { LearningService } from '../learning/learning.service';
import { RiskService } from '../risk/risk.service';
import { Employee } from '../employees/entities/employee.entity';
import { PromotionReadinessBand, RatingBand, ReportType } from '../common/enums';

export interface ReportColumn {
  key: string;
  label: string;
}

export interface ReportData {
  title: string;
  columns: ReportColumn[];
  rows: Record<string, string | number>[];
}

export interface ReportFilters {
  year?: number;
  quarter?: string;
}

@Injectable()
export class ReportsService {
  constructor(
    private readonly employeesService: EmployeesService,
    private readonly evaluationsService: EvaluationsService,
    private readonly promotionReadinessService: PromotionReadinessService,
    private readonly talentMatrixService: TalentMatrixService,
    private readonly learningService: LearningService,
    private readonly riskService: RiskService,
  ) {}

  async getReportData(type: ReportType, filters: ReportFilters = {}): Promise<ReportData> {
    switch (type) {
      case ReportType.TEAM_PERFORMANCE:
        return this.getTeamPerformanceReport();
      case ReportType.QUARTERLY_REVIEW:
        return this.getQuarterlyReviewReport(filters);
      case ReportType.PROMOTION_CANDIDATES:
        return this.getPromotionCandidatesReport();
      case ReportType.TALENT_MATRIX:
        return this.getTalentMatrixReport();
      case ReportType.LEARNING_GROWTH:
        return this.getLearningGrowthReport();
      case ReportType.HIGH_PERFORMERS:
        return this.getHighPerformersReport();
      case ReportType.RISK_ASSESSMENT:
        return this.getRiskAssessmentReport();
      default:
        throw new BadRequestException(`Unknown report type: ${type}`);
    }
  }

  private async getEmployees(): Promise<Employee[]> {
    return this.employeesService.findAll();
  }

  private async getTeamPerformanceReport(): Promise<ReportData> {
    const employees = await this.getEmployees();
    const latestEvaluations = await this.evaluationsService.getLatestForEmployees(
      employees.map((employee) => employee.id),
    );

    const rows = employees.map((employee) => {
      const evaluation = latestEvaluations.get(employee.id);
      return {
        employeeCode: employee.employeeCode,
        fullName: employee.fullName,
        department: employee.department,
        designation: employee.designation,
        period: evaluation ? `${evaluation.year} ${evaluation.quarter}` : '-',
        overallScore: evaluation ? Number(evaluation.overallScore) : '-',
        ratingBand: evaluation ? evaluation.ratingBand : '-',
      };
    });

    return {
      title: 'Team Performance Report',
      columns: [
        { key: 'employeeCode', label: 'Employee ID' },
        { key: 'fullName', label: 'Name' },
        { key: 'department', label: 'Department' },
        { key: 'designation', label: 'Designation' },
        { key: 'period', label: 'Latest Review Period' },
        { key: 'overallScore', label: 'Overall Score' },
        { key: 'ratingBand', label: 'Rating Band' },
      ],
      rows,
    };
  }

  private async getQuarterlyReviewReport(filters: ReportFilters): Promise<ReportData> {
    const evaluations = await this.evaluationsService.findAll({
      year: filters.year,
      quarter: filters.quarter,
    });

    const rows = evaluations.map((evaluation) => ({
      employeeCode: evaluation.employee?.employeeCode ?? '-',
      fullName: evaluation.employee?.fullName ?? '-',
      year: evaluation.year,
      quarter: evaluation.quarter,
      deliveryScore: Number(evaluation.deliveryScore),
      technicalScore: Number(evaluation.technicalScore),
      qualityScore: Number(evaluation.qualityScore),
      collaborationScore: Number(evaluation.collaborationScore),
      learningScore: Number(evaluation.learningScore),
      overallScore: Number(evaluation.overallScore),
      ratingBand: evaluation.ratingBand,
      finalRating: evaluation.finalRating ?? '-',
      status: evaluation.status,
    }));

    return {
      title: 'Quarterly Review Report',
      columns: [
        { key: 'employeeCode', label: 'Employee ID' },
        { key: 'fullName', label: 'Name' },
        { key: 'year', label: 'Year' },
        { key: 'quarter', label: 'Quarter' },
        { key: 'deliveryScore', label: 'Delivery' },
        { key: 'technicalScore', label: 'Technical' },
        { key: 'qualityScore', label: 'Quality' },
        { key: 'collaborationScore', label: 'Collaboration' },
        { key: 'learningScore', label: 'Learning' },
        { key: 'overallScore', label: 'Overall Score' },
        { key: 'ratingBand', label: 'Rating Band' },
        { key: 'finalRating', label: 'Final Rating' },
        { key: 'status', label: 'Status' },
      ],
      rows,
    };
  }

  private async getPromotionCandidatesReport(): Promise<ReportData> {
    const dashboard = await this.promotionReadinessService.getDashboard();
    const employees = await this.getEmployees();
    const employeesById = new Map(employees.map((employee) => [employee.id, employee]));

    const candidates = dashboard.items.filter(
      (item) =>
        item.assessment &&
        [PromotionReadinessBand.NEAR_READY, PromotionReadinessBand.PROMOTION_READY].includes(
          item.assessment.readinessBand,
        ),
    );

    const rows = candidates.map((item) => {
      const employee = employeesById.get(item.employee.id);
      return {
        employeeCode: employee?.employeeCode ?? '-',
        fullName: item.employee.fullName,
        currentRole: employee?.currentRole ?? '-',
        targetRole: employee?.targetRole ?? '-',
        readinessPercentage: item.assessment ? Number(item.assessment.readinessPercentage) : 0,
        readinessBand: item.assessment?.readinessBand ?? '-',
        promotionTargetDate: employee?.promotionTargetDate ?? '-',
      };
    });

    return {
      title: 'Promotion Candidate Report',
      columns: [
        { key: 'employeeCode', label: 'Employee ID' },
        { key: 'fullName', label: 'Name' },
        { key: 'currentRole', label: 'Current Role' },
        { key: 'targetRole', label: 'Target Role' },
        { key: 'readinessPercentage', label: 'Readiness %' },
        { key: 'readinessBand', label: 'Readiness Band' },
        { key: 'promotionTargetDate', label: 'Promotion Target Date' },
      ],
      rows,
    };
  }

  private async getTalentMatrixReport(): Promise<ReportData> {
    const entries = await this.talentMatrixService.findAll();

    const rows = entries.map((entry) => ({
      fullName: entry.employee?.fullName ?? '-',
      designation: entry.employee?.designation ?? '-',
      department: entry.employee?.department ?? '-',
      potentialScore: Number(entry.potentialScore),
      performanceScore: Number(entry.performanceScore),
      category: entry.category,
    }));

    return {
      title: 'Talent Matrix Report',
      columns: [
        { key: 'fullName', label: 'Name' },
        { key: 'designation', label: 'Designation' },
        { key: 'department', label: 'Department' },
        { key: 'potentialScore', label: 'Potential Score' },
        { key: 'performanceScore', label: 'Performance Score' },
        { key: 'category', label: 'Talent Category' },
      ],
      rows,
    };
  }

  private async getLearningGrowthReport(): Promise<ReportData> {
    const employees = await this.getEmployees();

    const rows = await Promise.all(
      employees.map(async (employee) => {
        const summary = await this.learningService.getSummary(employee.id);
        return {
          employeeCode: employee.employeeCode,
          fullName: employee.fullName,
          department: employee.department,
          totalLearningHours: summary.totalLearningHours,
          certificationsEarned: summary.certificationsEarned,
          skillsAcquired: summary.skillsAcquired.join(', ') || '-',
        };
      }),
    );

    return {
      title: 'Learning & Growth Report',
      columns: [
        { key: 'employeeCode', label: 'Employee ID' },
        { key: 'fullName', label: 'Name' },
        { key: 'department', label: 'Department' },
        { key: 'totalLearningHours', label: 'Total Learning Hours' },
        { key: 'certificationsEarned', label: 'Certifications Earned' },
        { key: 'skillsAcquired', label: 'Skills Acquired' },
      ],
      rows,
    };
  }

  private async getHighPerformersReport(): Promise<ReportData> {
    const employees = await this.getEmployees();
    const latestEvaluations = await this.evaluationsService.getLatestForEmployees(
      employees.map((employee) => employee.id),
    );

    const rows = employees
      .map((employee) => ({ employee, evaluation: latestEvaluations.get(employee.id) }))
      .filter(
        ({ evaluation }) =>
          evaluation &&
          [RatingBand.OUTSTANDING, RatingBand.EXCEEDS_EXPECTATIONS].includes(evaluation.ratingBand),
      )
      .map(({ employee, evaluation }) => ({
        employeeCode: employee.employeeCode,
        fullName: employee.fullName,
        department: employee.department,
        designation: employee.designation,
        overallScore: evaluation ? Number(evaluation.overallScore) : 0,
        ratingBand: evaluation?.ratingBand ?? '-',
      }));

    return {
      title: 'High Performer Report',
      columns: [
        { key: 'employeeCode', label: 'Employee ID' },
        { key: 'fullName', label: 'Name' },
        { key: 'department', label: 'Department' },
        { key: 'designation', label: 'Designation' },
        { key: 'overallScore', label: 'Overall Score' },
        { key: 'ratingBand', label: 'Rating Band' },
      ],
      rows,
    };
  }

  private async getRiskAssessmentReport(): Promise<ReportData> {
    const heatmap = await this.riskService.getHeatmap();

    const rows = heatmap.items.map((item) => ({
      fullName: item.employee.fullName,
      department: item.employee.department,
      designation: item.employee.designation,
      attritionRisk: item.assessment.attritionRisk,
      burnoutRisk: item.assessment.burnoutRisk,
      skillGapRisk: item.assessment.skillGapRisk,
      performanceRisk: item.assessment.performanceRisk,
    }));

    return {
      title: 'Risk Assessment Report',
      columns: [
        { key: 'fullName', label: 'Name' },
        { key: 'department', label: 'Department' },
        { key: 'designation', label: 'Designation' },
        { key: 'attritionRisk', label: 'Attrition Risk' },
        { key: 'burnoutRisk', label: 'Burnout Risk' },
        { key: 'skillGapRisk', label: 'Skill Gap Risk' },
        { key: 'performanceRisk', label: 'Performance Risk' },
      ],
      rows,
    };
  }
}
