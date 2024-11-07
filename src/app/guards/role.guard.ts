import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { RoleService } from '../services/auth/role.service';
import { Roles } from '../enums/enums';


@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private roleService: RoleService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const requiredRoles = route.data['roles'] as Roles[];
    if (this.roleService.hasAnyRole(requiredRoles)) {
      return true;
    }
    this.router.navigate(['/access-denied']);
    return false;
  }
}