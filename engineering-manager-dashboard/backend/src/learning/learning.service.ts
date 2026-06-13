import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LearningActivity } from './entities/learning-activity.entity';
import { CreateLearningActivityDto } from './dto/create-learning-activity.dto';
import { UpdateLearningActivityDto } from './dto/update-learning-activity.dto';
import { LearningCompletionStatus } from '../common/enums';

@Injectable()
export class LearningService {
  constructor(
    @InjectRepository(LearningActivity)
    private readonly learningRepository: Repository<LearningActivity>,
  ) {}

  async findAll(filters: { employeeId?: string } = {}): Promise<LearningActivity[]> {
    const qb = this.learningRepository
      .createQueryBuilder('learning')
      .leftJoinAndSelect('learning.employee', 'employee')
      .orderBy('learning.createdAt', 'DESC');

    if (filters.employeeId) {
      qb.andWhere('learning.employeeId = :employeeId', { employeeId: filters.employeeId });
    }

    return qb.getMany();
  }

  async findOne(id: string): Promise<LearningActivity> {
    const activity = await this.learningRepository.findOne({
      where: { id },
      relations: { employee: true },
    });

    if (!activity) {
      throw new NotFoundException(`Learning activity with id ${id} not found`);
    }

    return activity;
  }

  async create(dto: CreateLearningActivityDto): Promise<LearningActivity> {
    const activity = this.learningRepository.create(dto);
    return this.learningRepository.save(activity);
  }

  async update(id: string, dto: UpdateLearningActivityDto): Promise<LearningActivity> {
    const activity = await this.findOne(id);
    Object.assign(activity, dto);
    return this.learningRepository.save(activity);
  }

  async remove(id: string): Promise<void> {
    const activity = await this.findOne(id);
    await this.learningRepository.remove(activity);
  }

  async getSummary(employeeId: string): Promise<{
    totalLearningHours: number;
    certificationsEarned: number;
    skillsAcquired: string[];
  }> {
    const activities = await this.learningRepository.find({ where: { employeeId } });

    const totalLearningHours = activities.reduce(
      (sum, activity) => sum + Number(activity.learningHours),
      0,
    );

    const certificationsEarned = activities.filter(
      (activity) =>
        activity.certificationName != null &&
        activity.completionStatus === LearningCompletionStatus.COMPLETED,
    ).length;

    const skillsAcquired = Array.from(
      new Set(
        activities
          .filter((activity) => activity.completionStatus === LearningCompletionStatus.COMPLETED)
          .map((activity) => activity.skillArea),
      ),
    );

    return { totalLearningHours, certificationsEarned, skillsAcquired };
  }
}
