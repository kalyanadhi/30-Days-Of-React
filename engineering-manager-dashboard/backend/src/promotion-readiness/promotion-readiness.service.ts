import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PromotionReadiness } from './entities/promotion-readiness.entity';
import { CreatePromotionReadinessDto } from './dto/create-promotion-readiness.dto';
import { UpdatePromotionReadinessDto } from './dto/update-promotion-readiness.dto';
import { calculateReadinessPercentage, getPromotionReadinessBand } from '../common/utils/scoring.util';
import { PromotionReadinessBand } from '../common/enums';
import { EmployeesService } from '../employees/employees.service';

@Injectable()
export class PromotionReadinessService {
  constructor(
    @InjectRepository(PromotionReadiness)
    private readonly promotionReadinessRepository: Repository<PromotionReadiness>,
    private readonly employeesService: EmployeesService,
  ) {}

  async findAll(filters: { employeeId?: string } = {}): Promise<PromotionReadiness[]> {
    const qb = this.promotionReadinessRepository
      .createQueryBuilder('assessment')
      .leftJoinAndSelect('assessment.employee', 'employee')
      .orderBy('assessment.assessmentDate', 'DESC');

    if (filters.employeeId) {
      qb.andWhere('assessment.employeeId = :employeeId', { employeeId: filters.employeeId });
    }

    return qb.getMany();
  }

  async findOne(id: string): Promise<PromotionReadiness> {
    const assessment = await this.promotionReadinessRepository.findOne({
      where: { id },
      relations: { employee: true },
    });

    if (!assessment) {
      throw new NotFoundException(`Promotion readiness assessment with id ${id} not found`);
    }

    return assessment;
  }

  async findLatestForEmployee(employeeId: string): Promise<PromotionReadiness | null> {
    const assessment = await this.promotionReadinessRepository.findOne({
      where: { employeeId },
      order: { assessmentDate: 'DESC' },
    });

    return assessment ?? null;
  }

  async create(dto: CreatePromotionReadinessDto): Promise<PromotionReadiness> {
    const { readinessPercentage, readinessBand } = this.computeReadiness(dto);

    const assessment = this.promotionReadinessRepository.create({
      ...dto,
      readinessPercentage,
      readinessBand,
    });

    const saved = await this.promotionReadinessRepository.save(assessment);

    await this.employeesService.updateReadinessPercentage(dto.employeeId, readinessPercentage);

    return saved;
  }

  async update(id: string, dto: UpdatePromotionReadinessDto): Promise<PromotionReadiness> {
    const assessment = await this.findOne(id);
    Object.assign(assessment, dto);

    const { readinessPercentage, readinessBand } = this.computeReadiness(assessment);
    assessment.readinessPercentage = readinessPercentage;
    assessment.readinessBand = readinessBand;

    const saved = await this.promotionReadinessRepository.save(assessment);

    const latest = await this.findLatestForEmployee(assessment.employeeId);
    if (latest && latest.id === saved.id) {
      await this.employeesService.updateReadinessPercentage(assessment.employeeId, readinessPercentage);
    }

    return saved;
  }

  async remove(id: string): Promise<void> {
    const assessment = await this.findOne(id);
    await this.promotionReadinessRepository.remove(assessment);
  }

  async getDashboard(): Promise<{
    items: Array<{
      employee: { id: string; fullName: string; designation: string; department: string };
      assessment: PromotionReadiness | null;
    }>;
    summary: {
      notReady: number;
      developing: number;
      nearReady: number;
      promotionReady: number;
    };
  }> {
    const employees = await this.employeesService.findAll();

    const latestAssessments = await this.getLatestAssessmentsForEmployees(
      employees.map((employee) => employee.id),
    );

    const summary = {
      notReady: 0,
      developing: 0,
      nearReady: 0,
      promotionReady: 0,
    };

    const items = employees.map((employee) => {
      const assessment = latestAssessments.get(employee.id) ?? null;

      if (assessment) {
        switch (assessment.readinessBand) {
          case PromotionReadinessBand.NOT_READY:
            summary.notReady += 1;
            break;
          case PromotionReadinessBand.DEVELOPING:
            summary.developing += 1;
            break;
          case PromotionReadinessBand.NEAR_READY:
            summary.nearReady += 1;
            break;
          case PromotionReadinessBand.PROMOTION_READY:
            summary.promotionReady += 1;
            break;
        }
      }

      return {
        employee: {
          id: employee.id,
          fullName: employee.fullName,
          designation: employee.designation,
          department: employee.department,
        },
        assessment,
      };
    });

    return { items, summary };
  }

  private async getLatestAssessmentsForEmployees(
    employeeIds: string[],
  ): Promise<Map<string, PromotionReadiness>> {
    if (employeeIds.length === 0) {
      return new Map();
    }

    const assessments = await this.promotionReadinessRepository
      .createQueryBuilder('assessment')
      .where('assessment.employeeId IN (:...employeeIds)', { employeeIds })
      .orderBy('assessment.employeeId', 'ASC')
      .addOrderBy('assessment.assessmentDate', 'DESC')
      .getMany();

    const latestByEmployee = new Map<string, PromotionReadiness>();
    for (const assessment of assessments) {
      if (!latestByEmployee.has(assessment.employeeId)) {
        latestByEmployee.set(assessment.employeeId, assessment);
      }
    }

    return latestByEmployee;
  }

  private computeReadiness(dimensions: {
    technicalCapability: number;
    leadership: number;
    ownership: number;
    delivery: number;
    influence: number;
    communication: number;
  }) {
    const readinessPercentage = calculateReadinessPercentage({
      technicalCapability: Number(dimensions.technicalCapability),
      leadership: Number(dimensions.leadership),
      ownership: Number(dimensions.ownership),
      delivery: Number(dimensions.delivery),
      influence: Number(dimensions.influence),
      communication: Number(dimensions.communication),
    });

    return { readinessPercentage, readinessBand: getPromotionReadinessBand(readinessPercentage) };
  }
}
