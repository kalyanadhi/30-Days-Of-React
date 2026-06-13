import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TalentMatrixEntry } from './entities/talent-matrix-entry.entity';
import { CreateTalentMatrixEntryDto } from './dto/create-talent-matrix-entry.dto';
import { UpdateTalentMatrixEntryDto } from './dto/update-talent-matrix-entry.dto';
import { getTalentCategory } from './talent-matrix.util';

@Injectable()
export class TalentMatrixService {
  constructor(
    @InjectRepository(TalentMatrixEntry)
    private readonly talentMatrixRepository: Repository<TalentMatrixEntry>,
  ) {}

  async findAll(): Promise<TalentMatrixEntry[]> {
    return this.talentMatrixRepository
      .createQueryBuilder('entry')
      .leftJoin('entry.employee', 'employee')
      .addSelect([
        'employee.id',
        'employee.fullName',
        'employee.designation',
        'employee.department',
        'employee.currentRole',
      ])
      .getMany();
  }

  async findOne(id: string): Promise<TalentMatrixEntry> {
    const entry = await this.talentMatrixRepository.findOne({
      where: { id },
      relations: { employee: true },
    });

    if (!entry) {
      throw new NotFoundException(`Talent matrix entry with id ${id} not found`);
    }

    return entry;
  }

  async findByEmployee(employeeId: string): Promise<TalentMatrixEntry | null> {
    const entry = await this.talentMatrixRepository.findOne({
      where: { employeeId },
      relations: { employee: true },
    });

    return entry ?? null;
  }

  async upsertForEmployee(dto: CreateTalentMatrixEntryDto): Promise<TalentMatrixEntry> {
    const category = getTalentCategory(Number(dto.potentialScore), Number(dto.performanceScore));

    const existing = await this.talentMatrixRepository.findOne({
      where: { employeeId: dto.employeeId },
    });

    if (existing) {
      Object.assign(existing, dto, { category });
      return this.talentMatrixRepository.save(existing);
    }

    const entry = this.talentMatrixRepository.create({
      ...dto,
      category,
    });

    return this.talentMatrixRepository.save(entry);
  }

  async update(id: string, dto: UpdateTalentMatrixEntryDto): Promise<TalentMatrixEntry> {
    const entry = await this.findOne(id);
    Object.assign(entry, dto);

    entry.category = getTalentCategory(Number(entry.potentialScore), Number(entry.performanceScore));

    return this.talentMatrixRepository.save(entry);
  }

  async remove(id: string): Promise<void> {
    const entry = await this.findOne(id);
    await this.talentMatrixRepository.remove(entry);
  }
}
