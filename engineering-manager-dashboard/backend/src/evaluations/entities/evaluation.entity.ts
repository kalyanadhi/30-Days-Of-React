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
import { EvaluationStatus, Quarter, RatingBand } from '../../common/enums';

@Entity('performance_evaluations')
export class PerformanceEvaluation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ name: 'employee_id' })
  employeeId: string;

  @Column({ type: 'enum', enum: Quarter })
  quarter: Quarter;

  @Column({ type: 'int' })
  year: number;

  // ----- Weighted Category Scores (1-5) -----
  @Column({ name: 'delivery_score', type: 'decimal', precision: 3, scale: 2 })
  deliveryScore: number;

  @Column({ name: 'technical_score', type: 'decimal', precision: 3, scale: 2 })
  technicalScore: number;

  @Column({ name: 'quality_score', type: 'decimal', precision: 3, scale: 2 })
  qualityScore: number;

  @Column({ name: 'collaboration_score', type: 'decimal', precision: 3, scale: 2 })
  collaborationScore: number;

  @Column({ name: 'learning_score', type: 'decimal', precision: 3, scale: 2 })
  learningScore: number;

  // ----- Computed -----
  @Column({ name: 'overall_score', type: 'decimal', precision: 3, scale: 2 })
  overallScore: number;

  @Column({ name: 'rating_band', type: 'enum', enum: RatingBand })
  ratingBand: RatingBand;

  // ----- Narrative -----
  @Column({ name: 'manager_feedback', type: 'text', nullable: true })
  managerFeedback: string | null;

  @Column({ name: 'employee_comments', type: 'text', nullable: true })
  employeeComments: string | null;

  @Column({ name: 'calibration_notes', type: 'text', nullable: true })
  calibrationNotes: string | null;

  @Column({ name: 'final_rating', type: 'enum', enum: RatingBand, nullable: true })
  finalRating: RatingBand | null;

  @Column({ type: 'enum', enum: EvaluationStatus, default: EvaluationStatus.DRAFT })
  status: EvaluationStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
