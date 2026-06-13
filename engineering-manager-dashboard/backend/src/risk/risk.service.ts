import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RiskAssessment } from './entities/risk-assessment.entity';
import { CreateRiskAssessmentDto } from './dto/create-risk-assessment.dto';
import { UpdateRiskAssessmentDto } from './dto/update-risk-assessment.dto';
import { RiskLevel } from '../common/enums';

type RiskCounts = { low: number; medium: number; high: number };

@Injectable()
export class RiskService {
  constructor(
    @InjectRepository(RiskAssessment)
    private readonly riskRepository: Repository<RiskAssessment>,
  ) {}

  async findAll(filters: { employeeId?: string } = {}): Promise<RiskAssessment[]> {
    const qb = this.riskRepository
      .createQueryBuilder('risk')
      .leftJoinAndSelect('risk.employee', 'employee')
      .orderBy('risk.assessmentDate', 'DESC');

    if (filters.employeeId) {
      qb.andWhere('risk.employeeId = :employeeId', { employeeId: filters.employeeId });
    }

    return qb.getMany();
  }

  async findOne(id: string): Promise<RiskAssessment> {
    const assessment = await this.riskRepository.findOne({
      where: { id },
      relations: { employee: true },
    });

    if (!assessment) {
      throw new NotFoundException(`Risk assessment with id ${id} not found`);
    }

    return assessment;
  }

  async findLatestForEmployee(employeeId: string): Promise<RiskAssessment | null> {
    const assessment = await this.riskRepository.findOne({
      where: { employeeId },
      order: { assessmentDate: 'DESC' },
    });

    return assessment ?? null;
  }

  async create(dto: CreateRiskAssessmentDto): Promise<RiskAssessment> {
    const assessment = this.riskRepository.create(dto);
    return this.riskRepository.save(assessment);
  }

  async update(id: string, dto: UpdateRiskAssessmentDto): Promise<RiskAssessment> {
    const assessment = await this.findOne(id);
    Object.assign(assessment, dto);
    return this.riskRepository.save(assessment);
  }

  async remove(id: string): Promise<void> {
    const assessment = await this.findOne(id);
    await this.riskRepository.remove(assessment);
  }

  async getHeatmap(): Promise<{
    items: Array<{
      employee: { id: string; fullName: string; designation: string; department: string };
      assessment: RiskAssessment;
    }>;
    summary: {
      attrition: RiskCounts;
      burnout: RiskCounts;
      skillGap: RiskCounts;
      performance: RiskCounts;
    };
  }> {
    const assessments = await this.riskRepository
      .createQueryBuilder('risk')
      .leftJoinAndSelect('risk.employee', 'employee')
      .orderBy('risk.employeeId', 'ASC')
      .addOrderBy('risk.assessmentDate', 'DESC')
      .getMany();

    const latestByEmployee = new Map<string, RiskAssessment>();
    for (const assessment of assessments) {
      if (!latestByEmployee.has(assessment.employeeId)) {
        latestByEmployee.set(assessment.employeeId, assessment);
      }
    }

    const summary = {
      attrition: this.emptyCounts(),
      burnout: this.emptyCounts(),
      skillGap: this.emptyCounts(),
      performance: this.emptyCounts(),
    };

    const items = Array.from(latestByEmployee.values()).map((assessment) => {
      this.incrementCount(summary.attrition, assessment.attritionRisk);
      this.incrementCount(summary.burnout, assessment.burnoutRisk);
      this.incrementCount(summary.skillGap, assessment.skillGapRisk);
      this.incrementCount(summary.performance, assessment.performanceRisk);

      return {
        employee: {
          id: assessment.employee.id,
          fullName: assessment.employee.fullName,
          designation: assessment.employee.designation,
          department: assessment.employee.department,
        },
        assessment,
      };
    });

    return { items, summary };
  }

  private emptyCounts(): RiskCounts {
    return { low: 0, medium: 0, high: 0 };
  }

  private incrementCount(counts: RiskCounts, level: RiskLevel): void {
    switch (level) {
      case RiskLevel.LOW:
        counts.low += 1;
        break;
      case RiskLevel.MEDIUM:
        counts.medium += 1;
        break;
      case RiskLevel.HIGH:
        counts.high += 1;
        break;
    }
  }
}
