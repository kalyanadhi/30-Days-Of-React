import { Role } from '../../common/enums';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: Role;
  employeeId: string | null;
}
