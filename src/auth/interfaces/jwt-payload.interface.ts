import { Role } from '../../common/enums/roles.enum';

export interface JwtPayload {
    userId: string;
    tenantId: string; 
    role: Role;       
    email: string;
  }