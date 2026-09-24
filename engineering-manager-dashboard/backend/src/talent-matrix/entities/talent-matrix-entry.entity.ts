import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';
import { Quarter, TalentCategory } from '../../common/enums';

@Entity('talent_matrix_entries')
export class TalentMatrixEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ name: 'employee_id', unique: true })
  employeeId: string;

  @Column({ name: 'potential_score', type: 'decimal', precision: 5, scale: 2 })
  potentialScore: number;

  @Column({ name: 'performance_score', type: 'decimal', precision: 5, scale: 2 })
  performanceScore: number;

  @Column({ type: 'enum', enum: TalentCategory })
  category: TalentCategory;

  @Column({ type: 'enum', enum: Quarter, nullable: true })
  quarter: Quarter | null;

  @Column({ type: 'int', nullable: true })
  year: number | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
