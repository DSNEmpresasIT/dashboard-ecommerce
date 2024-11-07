import { Roles } from "../enums/enums";


export interface AuthenticatedUser {
  id: number;
  isActive: boolean;
  user_name: string;
  companyId: number;
  catalogId: number;
  email: string;
  // company: Company;
  role: Roles;
}

export interface UserAuthPayload {
  status: boolean;
  user: AuthenticatedUser;
  token: string;
}
