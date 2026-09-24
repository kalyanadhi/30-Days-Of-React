import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OneOnOne } from './entities/one-on-one.entity';
import { CreateOneOnOneDto } from './dto/create-one-on-one.dto';
import { UpdateOneOnOneDto } from './dto/update-one-on-one.dto';

@Injectable()
export class OneOnOnesService {
  constructor(
    @InjectRepository(OneOnOne)
    private readonly oneOnOnesRepository: Repository<OneOnOne>,
  ) {}

  async findAll(filters: { employeeId?: string } = {}): Promise<OneOnOne[]> {
    const qb = this.oneOnOnesRepository
      .createQueryBuilder('oneOnOne')
      .leftJoinAndSelect('oneOnOne.employee', 'employee')
      .orderBy('oneOnOne.meetingDate', 'DESC');

    if (filters.employeeId) {
      qb.andWhere('oneOnOne.employeeId = :employeeId', { employeeId: filters.employeeId });
    }

    return qb.getMany();
  }

  async findOne(id: string): Promise<OneOnOne> {
    const oneOnOne = await this.oneOnOnesRepository.findOne({
      where: { id },
      relations: { employee: true },
    });

    if (!oneOnOne) {
      throw new NotFoundException(`One-on-one with id ${id} not found`);
    }

    return oneOnOne;
  }

  async create(dto: CreateOneOnOneDto): Promise<OneOnOne> {
    const oneOnOne = this.oneOnOnesRepository.create(dto);
    return this.oneOnOnesRepository.save(oneOnOne);
  }

  async update(id: string, dto: UpdateOneOnOneDto): Promise<OneOnOne> {
    const oneOnOne = await this.findOne(id);
    Object.assign(oneOnOne, dto);
    return this.oneOnOnesRepository.save(oneOnOne);
  }

  async remove(id: string): Promise<void> {
    const oneOnOne = await this.findOne(id);
    await this.oneOnOnesRepository.remove(oneOnOne);
  }
}
