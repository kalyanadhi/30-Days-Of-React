import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { QueryEmployeeDto } from './dto/query-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeesRepository: Repository<Employee>,
  ) {}

  async findAll(query: QueryEmployeeDto = {}): Promise<Employee[]> {
    const qb = this.employeesRepository
      .createQueryBuilder('employee')
      .leftJoinAndSelect('employee.manager', 'manager')
      .orderBy('employee.fullName', 'ASC');

    if (query.search) {
      qb.andWhere(
        '(LOWER(employee.fullName) LIKE :search OR LOWER(employee.email) LIKE :search OR LOWER(employee.employeeCode) LIKE :search)',
        { search: `%${query.search.toLowerCase()}%` },
      );
    }

    if (query.department) {
      qb.andWhere('employee.department = :department', { department: query.department });
    }

    if (query.project) {
      qb.andWhere('employee.project = :project', { project: query.project });
    }

    if (query.gradeBand) {
      qb.andWhere('employee.gradeBand = :gradeBand', { gradeBand: query.gradeBand });
    }

    if (query.managerId) {
      qb.andWhere('employee.managerId = :managerId', { managerId: query.managerId });
    }

    return qb.getMany();
  }

  async findOne(id: string): Promise<Employee> {
    const employee = await this.employeesRepository.findOne({
      where: { id },
      relations: { manager: true, directReports: true },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with id ${id} not found`);
    }

    return employee;
  }

  async findTeam(managerId: string): Promise<Employee[]> {
    return this.employeesRepository.find({
      where: { managerId },
      order: { fullName: 'ASC' },
    });
  }

  async create(dto: CreateEmployeeDto): Promise<Employee> {
    const existing = await this.employeesRepository.findOne({
      where: [{ email: dto.email }, { employeeCode: dto.employeeCode }],
    });

    if (existing) {
      throw new ConflictException('An employee with this email or employee code already exists');
    }

    const employee = this.employeesRepository.create(dto);
    return this.employeesRepository.save(employee);
  }

  async update(id: string, dto: UpdateEmployeeDto): Promise<Employee> {
    const employee = await this.findOne(id);
    Object.assign(employee, dto);
    return this.employeesRepository.save(employee);
  }

  async remove(id: string): Promise<void> {
    const employee = await this.findOne(id);
    await this.employeesRepository.remove(employee);
  }

  async updateReadinessPercentage(id: string, readinessPercentage: number): Promise<void> {
    await this.employeesRepository.update(id, { readinessPercentage });
  }

  async count(): Promise<number> {
    return this.employeesRepository.count();
  }

  async getDistinctDepartments(): Promise<string[]> {
    const rows = await this.employeesRepository
      .createQueryBuilder('employee')
      .select('DISTINCT employee.department', 'department')
      .getRawMany();
    return rows.map((row) => row.department);
  }
}
