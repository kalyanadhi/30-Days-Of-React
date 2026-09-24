import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ----- Personal Information -----
  @Column({ name: 'employee_code', unique: true })
  employeeCode: string;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  designation: string;

  @Column({ name: 'grade_band' })
  gradeBand: string;

  @Column()
  department: string;

  @Column({ name: 'project_name' })
  project: string;

  @ManyToOne(() => Employee, (employee) => employee.directReports, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'manager_id' })
  manager: Employee | null;

  @Column({ name: 'manager_id', nullable: true })
  managerId: string | null;

  @OneToMany(() => Employee, (employee) => employee.manager)
  directReports: Employee[];

  @Column({ name: 'joining_date', type: 'date' })
  joiningDate: string;

  @Column({ name: 'total_experience_years', type: 'decimal', precision: 4, scale: 1 })
  totalExperienceYears: number;

  @Column({ name: 'current_role_since', type: 'date' })
  currentRoleSince: string;

  @Column({ name: 'work_location' })
  workLocation: string;

  // ----- Career Information -----
  @Column({ name: 'current_role' })
  currentRole: string;

  @Column({ name: 'target_role', type: 'varchar', nullable: true })
  targetRole: string | null;

  @Column({ name: 'career_aspirations', type: 'text', nullable: true })
  careerAspirations: string | null;

  @Column({ name: 'promotion_target_date', type: 'date', nullable: true })
  promotionTargetDate: string | null;

  @Column({ name: 'readiness_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 })
  readinessPercentage: number;

  @Column({ name: 'avatar_url', type: 'varchar', nullable: true })
  avatarUrl: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
