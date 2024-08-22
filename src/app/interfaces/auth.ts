export interface Company {
  id: number;
  logo: string | null;
}

export interface AuthenticatedUser {
  id: number;
  isActive: boolean;
  userName: string;
  catalogId?: number;
  email: string;
  company: Company;
  role: string;
}

export interface UserAuthPayload {
  user: AuthenticatedUser;
  token: string;
}
