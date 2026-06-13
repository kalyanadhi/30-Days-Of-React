import { Role } from './enums';

export interface AuthEmployeeSummary {
  id: string;
  fullName: string;
  designation: string;
  avatarUrl: string | null;
}

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  employeeId: string | null;
  employee?: AuthEmployeeSummary | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}
