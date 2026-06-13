export interface Employee {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string;
  designation: string;
  gradeBand: string;
  department: string;
  project: string;
  manager?: Employee | null;
  managerId: string | null;
  joiningDate: string;
  totalExperienceYears: number;
  currentRoleSince: string;
  workLocation: string;
  currentRole: string;
  targetRole: string | null;
  careerAspirations: string | null;
  promotionTargetDate: string | null;
  readinessPercentage: number;
  avatarUrl: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateEmployeeRequest = Omit<
  Employee,
  'id' | 'manager' | 'createdAt' | 'updatedAt'
>;

export type UpdateEmployeeRequest = Partial<CreateEmployeeRequest>;
