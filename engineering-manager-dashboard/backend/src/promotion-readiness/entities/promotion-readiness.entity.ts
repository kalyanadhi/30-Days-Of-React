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
import { PromotionReadinessBand } from '../../common/enums';

@Entity('promotion_readiness_assessments')
export class PromotionReadiness {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ name: 'employee_id' })
  employeeId: string;

  @Column({ name: 'technical_capability', type: 'decimal', precision: 5, scale: 2 })
  technicalCapability: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  leadership: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  ownership: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  delivery: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  influence: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  communication: number;

  @Column({ name: 'readiness_percentage', type: 'decimal', precision: 5, scale: 2 })
  readinessPercentage: number;

  @Column({ name: 'readiness_band', type: 'enum', enum: PromotionReadinessBand })
  readinessBand: PromotionReadinessBand;

  @Column({ name: 'assessment_date', type: 'date' })
  assessmentDate: string;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
