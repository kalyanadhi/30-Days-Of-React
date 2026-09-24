import { Quarter, TalentCategory } from './enums';

export interface TalentMatrixEntry {
  id: string;
  employeeId: string;
  employee?: { id: string; fullName: string; designation: string; department: string; currentRole: string };
  potentialScore: number;
  performanceScore: number;
  category: TalentCategory;
  quarter: Quarter | null;
  year: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type UpsertTalentMatrixRequest = Omit<
  TalentMatrixEntry,
  'id' | 'employee' | 'category' | 'createdAt' | 'updatedAt'
>;
