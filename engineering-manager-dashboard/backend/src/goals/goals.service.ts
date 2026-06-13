import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Goal } from './entities/goal.entity';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { GoalStatus } from '../common/enums';

@Injectable()
export class GoalsService {
  constructor(
    @InjectRepository(Goal)
    private readonly goalsRepository: Repository<Goal>,
  ) {}

  async findAll(filters: { employeeId?: string } = {}): Promise<Goal[]> {
    const qb = this.goalsRepository
      .createQueryBuilder('goal')
      .leftJoinAndSelect('goal.employee', 'employee')
      .orderBy('goal.dueDate', 'ASC');

    if (filters.employeeId) {
      qb.andWhere('goal.employeeId = :employeeId', { employeeId: filters.employeeId });
    }

    return qb.getMany();
  }

  async findOne(id: string): Promise<Goal> {
    const goal = await this.goalsRepository.findOne({
      where: { id },
      relations: { employee: true },
    });

    if (!goal) {
      throw new NotFoundException(`Goal with id ${id} not found`);
    }

    return goal;
  }

  async create(dto: CreateGoalDto): Promise<Goal> {
    const goal = this.goalsRepository.create(dto);
    return this.goalsRepository.save(goal);
  }

  async update(id: string, dto: UpdateGoalDto): Promise<Goal> {
    const goal = await this.findOne(id);

    if (dto.status === GoalStatus.COMPLETED && !dto.completionDate && !goal.completionDate) {
      dto.completionDate = new Date().toISOString().slice(0, 10);
    }

    Object.assign(goal, dto);
    return this.goalsRepository.save(goal);
  }

  async remove(id: string): Promise<void> {
    const goal = await this.findOne(id);
    await this.goalsRepository.remove(goal);
  }
}
