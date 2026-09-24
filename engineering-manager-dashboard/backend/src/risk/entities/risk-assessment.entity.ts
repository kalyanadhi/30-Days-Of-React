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
import { RiskLevel } from '../../common/enums';

@Entity('risk_assessments')
export class RiskAssessment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ name: 'employee_id' })
  employeeId: string;

  @Column({ name: 'attrition_risk', type: 'enum', enum: RiskLevel })
  attritionRisk: RiskLevel;

  @Column({ name: 'burnout_risk', type: 'enum', enum: RiskLevel })
  burnoutRisk: RiskLevel;

  @Column({ name: 'skill_gap_risk', type: 'enum', enum: RiskLevel })
  skillGapRisk: RiskLevel;

  @Column({ name: 'performance_risk', type: 'enum', enum: RiskLevel })
  performanceRisk: RiskLevel;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'assessment_date', type: 'date' })
  assessmentDate: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
