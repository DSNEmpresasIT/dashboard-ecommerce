
import { Injectable } from '@angular/core';
import { Roles } from '../../enums/enums';
import { UserAuthPayload } from '../../interfaces/auth';
import { AuthService } from './auth.service';
@Injectable({
  providedIn: 'root'
})
export class RoleService {
  payload: UserAuthPayload | null = null;

  constructor(private authService: AuthService){
    authService.currentTokenPayload.subscribe(res => this.payload = res)
  }
  
  get userRole(): Roles | undefined {
    return this.payload?.user.role;
  }

  hasRole(role: Roles): boolean {
    return this.userRole === role;
  }

  hasAnyRole(roles: Roles[]): boolean {
    return roles.includes(this.userRole!);
  }
}