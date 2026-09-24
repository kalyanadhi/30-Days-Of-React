import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DevelopmentPlan } from './entities/development-plan.entity';
import { CreateDevelopmentPlanDto } from './dto/create-development-plan.dto';
import { UpdateDevelopmentPlanDto } from './dto/update-development-plan.dto';

@Injectable()
export class DevelopmentPlansService {
  constructor(
    @InjectRepository(DevelopmentPlan)
    private readonly developmentPlansRepository: Repository<DevelopmentPlan>,
  ) {}

  async findAll(filters: { employeeId?: string } = {}): Promise<DevelopmentPlan[]> {
    const qb = this.developmentPlansRepository
      .createQueryBuilder('developmentPlan')
      .leftJoinAndSelect('developmentPlan.employee', 'employee')
      .orderBy('developmentPlan.targetDate', 'ASC');

    if (filters.employeeId) {
      qb.andWhere('developmentPlan.employeeId = :employeeId', { employeeId: filters.employeeId });
    }

    return qb.getMany();
  }

  async findOne(id: string): Promise<DevelopmentPlan> {
    const developmentPlan = await this.developmentPlansRepository.findOne({
      where: { id },
      relations: { employee: true },
    });

    if (!developmentPlan) {
      throw new NotFoundException(`Development plan with id ${id} not found`);
    }

    return developmentPlan;
  }

  async create(dto: CreateDevelopmentPlanDto): Promise<DevelopmentPlan> {
    const developmentPlan = this.developmentPlansRepository.create(dto);
    return this.developmentPlansRepository.save(developmentPlan);
  }

  async update(id: string, dto: UpdateDevelopmentPlanDto): Promise<DevelopmentPlan> {
    const developmentPlan = await this.findOne(id);
    Object.assign(developmentPlan, dto);
    return this.developmentPlansRepository.save(developmentPlan);
  }

  async remove(id: string): Promise<void> {
    const developmentPlan = await this.findOne(id);
    await this.developmentPlansRepository.remove(developmentPlan);
  }
}
