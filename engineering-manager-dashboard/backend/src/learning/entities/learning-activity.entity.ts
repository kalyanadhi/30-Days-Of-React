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
import { LearningCompletionStatus } from '../../common/enums';

@Entity('learning_activities')
export class LearningActivity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ name: 'employee_id' })
  employeeId: string;

  @Column({ name: 'training_name' })
  trainingName: string;

  @Column({ name: 'certification_name', type: 'varchar', nullable: true })
  certificationName: string | null;

  @Column({ name: 'learning_hours', type: 'decimal', precision: 6, scale: 2, default: 0 })
  learningHours: number;

  @Column({
    name: 'completion_status',
    type: 'enum',
    enum: LearningCompletionStatus,
    default: LearningCompletionStatus.NOT_STARTED,
  })
  completionStatus: LearningCompletionStatus;

  @Column({ name: 'skill_area' })
  skillArea: string;

  @Column({ name: 'completion_date', type: 'date', nullable: true })
  completionDate: string | null;

  @Column({ name: 'expiry_date', type: 'date', nullable: true })
  expiryDate: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
