import { Roles } from "../enums/enums";
import { Company } from "./company";


export interface AuthenticatedUser {
  id: number;
  isActive: boolean;
  user_name: string;
  userName?:string
  companyId: number;
  catalogId: number;
  email: string;
  company?: Company;
  role: Roles;
}

export interface UserAuthPayload {
  status: boolean;
  user: AuthenticatedUser;
  token: string;
}
