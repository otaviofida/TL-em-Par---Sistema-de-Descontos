import { Role } from '../../generated/prisma/index.js';

export interface JwtPayload {
  userId: string;
  role: Role;
}

export interface AuthenticatedRequest {
  userId: string;
  userRole: Role;
}
