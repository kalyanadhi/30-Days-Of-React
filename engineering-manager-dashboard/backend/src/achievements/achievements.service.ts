import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Achievement } from './entities/achievement.entity';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { UpdateAchievementDto } from './dto/update-achievement.dto';

@Injectable()
export class AchievementsService {
  constructor(
    @InjectRepository(Achievement)
    private readonly achievementsRepository: Repository<Achievement>,
  ) {}

  async findAll(filters: { employeeId?: string } = {}): Promise<Achievement[]> {
    const qb = this.achievementsRepository
      .createQueryBuilder('achievement')
      .leftJoinAndSelect('achievement.employee', 'employee')
      .orderBy('achievement.date', 'DESC');

    if (filters.employeeId) {
      qb.andWhere('achievement.employeeId = :employeeId', { employeeId: filters.employeeId });
    }

    return qb.getMany();
  }

  async findOne(id: string): Promise<Achievement> {
    const achievement = await this.achievementsRepository.findOne({
      where: { id },
      relations: { employee: true },
    });

    if (!achievement) {
      throw new NotFoundException(`Achievement with id ${id} not found`);
    }

    return achievement;
  }

  async create(dto: CreateAchievementDto): Promise<Achievement> {
    const achievement = this.achievementsRepository.create(dto);
    return this.achievementsRepository.save(achievement);
  }

  async update(id: string, dto: UpdateAchievementDto): Promise<Achievement> {
    const achievement = await this.findOne(id);
    Object.assign(achievement, dto);
    return this.achievementsRepository.save(achievement);
  }

  async remove(id: string): Promise<void> {
    const achievement = await this.findOne(id);
    await this.achievementsRepository.remove(achievement);
  }
}
