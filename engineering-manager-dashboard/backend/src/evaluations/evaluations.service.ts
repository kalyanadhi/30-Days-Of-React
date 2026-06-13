import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PerformanceEvaluation } from './entities/evaluation.entity';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { UpdateEvaluationDto } from './dto/update-evaluation.dto';
import { calculateOverallScore, getRatingBand } from '../common/utils/scoring.util';

@Injectable()
export class EvaluationsService {
  constructor(
    @InjectRepository(PerformanceEvaluation)
    private readonly evaluationsRepository: Repository<PerformanceEvaluation>,
  ) {}

  async findAll(filters: { employeeId?: string; year?: number; quarter?: string } = {}) {
    const qb = this.evaluationsRepository
      .createQueryBuilder('evaluation')
      .leftJoinAndSelect('evaluation.employee', 'employee')
      .orderBy('evaluation.year', 'DESC')
      .addOrderBy('evaluation.quarter', 'DESC');

    if (filters.employeeId) {
      qb.andWhere('evaluation.employeeId = :employeeId', { employeeId: filters.employeeId });
    }

    if (filters.year) {
      qb.andWhere('evaluation.year = :year', { year: filters.year });
    }

    if (filters.quarter) {
      qb.andWhere('evaluation.quarter = :quarter', { quarter: filters.quarter });
    }

    return qb.getMany();
  }

  async findOne(id: string): Promise<PerformanceEvaluation> {
    const evaluation = await this.evaluationsRepository.findOne({
      where: { id },
      relations: { employee: true },
    });

    if (!evaluation) {
      throw new NotFoundException(`Evaluation with id ${id} not found`);
    }

    return evaluation;
  }

  async create(dto: CreateEvaluationDto): Promise<PerformanceEvaluation> {
    const existing = await this.evaluationsRepository.findOne({
      where: { employeeId: dto.employeeId, year: dto.year, quarter: dto.quarter },
    });

    if (existing) {
      throw new ConflictException(
        `An evaluation for ${dto.quarter} ${dto.year} already exists for this employee`,
      );
    }

    const { overallScore, ratingBand } = this.computeScore(dto);

    const evaluation = this.evaluationsRepository.create({
      ...dto,
      overallScore,
      ratingBand,
      finalRating: dto.finalRating ?? ratingBand,
    });

    return this.evaluationsRepository.save(evaluation);
  }

  async update(id: string, dto: UpdateEvaluationDto): Promise<PerformanceEvaluation> {
    const evaluation = await this.findOne(id);
    Object.assign(evaluation, dto);

    const { overallScore, ratingBand } = this.computeScore(evaluation);
    evaluation.overallScore = overallScore;
    evaluation.ratingBand = ratingBand;

    if (!dto.finalRating) {
      evaluation.finalRating = ratingBand;
    }

    return this.evaluationsRepository.save(evaluation);
  }

  async remove(id: string): Promise<void> {
    const evaluation = await this.findOne(id);
    await this.evaluationsRepository.remove(evaluation);
  }

  /**
   * Returns the most recent evaluation and its trend (delta) versus the
   * previous evaluation for the given employee.
   */
  async getTrend(employeeId: string) {
    const evaluations = await this.evaluationsRepository.find({
      where: { employeeId },
      order: { year: 'DESC', quarter: 'DESC' },
      take: 2,
    });

    const [latest, previous] = evaluations;

    if (!latest) {
      return { latest: null, previous: null, trend: 0 };
    }

    const trend = previous ? Number((latest.overallScore - previous.overallScore).toFixed(2)) : 0;

    return { latest, previous: previous ?? null, trend };
  }

  async getLatestForEmployees(employeeIds: string[]): Promise<Map<string, PerformanceEvaluation>> {
    if (employeeIds.length === 0) {
      return new Map();
    }

    const evaluations = await this.evaluationsRepository
      .createQueryBuilder('evaluation')
      .where('evaluation.employeeId IN (:...employeeIds)', { employeeIds })
      .orderBy('evaluation.employeeId', 'ASC')
      .addOrderBy('evaluation.year', 'DESC')
      .addOrderBy('evaluation.quarter', 'DESC')
      .getMany();

    const latestByEmployee = new Map<string, PerformanceEvaluation>();
    for (const evaluation of evaluations) {
      if (!latestByEmployee.has(evaluation.employeeId)) {
        latestByEmployee.set(evaluation.employeeId, evaluation);
      }
    }

    return latestByEmployee;
  }

  async getAllForEmployees(employeeIds: string[]): Promise<PerformanceEvaluation[]> {
    if (employeeIds.length === 0) {
      return [];
    }

    return this.evaluationsRepository
      .createQueryBuilder('evaluation')
      .where('evaluation.employeeId IN (:...employeeIds)', { employeeIds })
      .orderBy('evaluation.year', 'ASC')
      .addOrderBy('evaluation.quarter', 'ASC')
      .getMany();
  }

  private computeScore(scores: {
    deliveryScore: number;
    technicalScore: number;
    qualityScore: number;
    collaborationScore: number;
    learningScore: number;
  }) {
    const overallScore = calculateOverallScore({
      deliveryScore: Number(scores.deliveryScore),
      technicalScore: Number(scores.technicalScore),
      qualityScore: Number(scores.qualityScore),
      collaborationScore: Number(scores.collaborationScore),
      learningScore: Number(scores.learningScore),
    });

    return { overallScore, ratingBand: getRatingBand(overallScore) };
  }
}
