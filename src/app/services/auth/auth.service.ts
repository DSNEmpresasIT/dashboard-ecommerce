import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { AlertService, AlertsType } from '../alert.service';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserAuthPayload } from '../../interfaces/auth';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isLoggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  currentTokenPayload: BehaviorSubject<UserAuthPayload | null> =
    new BehaviorSubject<UserAuthPayload | null>(null);
  private GLOBALAPIURL = environment.GLOBALAPIURL;
  private readonly TOKEN_KEY = 'auth_token';

  
  constructor(
    private alert: AlertService,
    private router: Router,
    private http: HttpClient
  ) {}

  private saveToken(token: string) {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private removeToken() {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  getAuthHeaders(withBearer:boolean = true) {
    const token = this.getToken();
    let header ={
      'Content-Type': 'application/json; charset=utf-8',
      'Accept': 'application/json',
      'Authorization': `${withBearer ? 'Bearer' : ''} ${token}`,
    };

    return  header
  }

  async checkToken(): Promise<boolean> {
    const token = this.getToken();
    try {
      const response = await firstValueFrom(
        this.http.post<UserAuthPayload>(
          `${this.GLOBALAPIURL}auth/verify-token`,
          {},
          {
            headers: this.getAuthHeaders(false),
          }
        )
      );
      this.isLoggedIn.next(true);
      this.currentTokenPayload.next(response);
     
      return true;
    } catch (error) {
      console.error('Token verification failed:', error);

      if (this.isLoggedIn.value) {
        return true;
      } else {
        return false;
      }
    }
  }

  async login(email: string, password: string) {
    const body = { email, password };

    try {
      const response = await firstValueFrom(
        this.http.post<UserAuthPayload>(`${this.GLOBALAPIURL}auth/login`, body)
      );

      this.saveToken(response.token);
      this.isLoggedIn.next(true);
      
      this.currentTokenPayload.next(response);
      this.alert.show(6000, `Sesión iniciada con éxito`, AlertsType.SUCCESS);

      return { data: response, error: null };
    } catch (error) {
      this.alert.show(
        6000,
        `Las credenciales que estás usando no son válidas`,
        AlertsType.ERROR
      );
      return { data: null, error };
    }
  }

  logout(
    menssage: string = 'Sesión cerrada con éxito',
    status: AlertsType = AlertsType.SUCCESS
  ) {
    this.removeToken();
    this.isLoggedIn.next(false);
    this.currentTokenPayload.next(null);
    this.alert.show(6000, menssage, status);
    this.router.navigate(['/auth']);
  }
}
