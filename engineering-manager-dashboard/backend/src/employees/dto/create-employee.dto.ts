import {
  IsDateString,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  employeeCode: string;

  @IsString()
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  designation: string;

  @IsString()
  gradeBand: string;

  @IsString()
  department: string;

  @IsString()
  project: string;

  @IsOptional()
  @IsString()
  managerId?: string | null;

  @IsDateString()
  joiningDate: string;

  @IsNumber()
  @Min(0)
  totalExperienceYears: number;

  @IsDateString()
  currentRoleSince: string;

  @IsString()
  workLocation: string;

  @IsString()
  currentRole: string;

  @IsOptional()
  @IsString()
  targetRole?: string | null;

  @IsOptional()
  @IsString()
  careerAspirations?: string | null;

  @IsOptional()
  @IsDateString()
  promotionTargetDate?: string | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  readinessPercentage?: number;

  @IsOptional()
  @IsString()
  avatarUrl?: string | null;
}
