import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

 async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):Promise<boolean> {
    await this.authService.checkToken();
    let isLoggedIn = false;
    this.authService.currentTokenPayload.subscribe((value) => {
      console.log(value,' valor de currenttoken')
        if(value){
          value.user && (isLoggedIn = true)
          
        }
    });
  
    if (isLoggedIn) {
      return true;
    } else {
      this.router.navigate(['auth']);
      return false;
    }
  }
}