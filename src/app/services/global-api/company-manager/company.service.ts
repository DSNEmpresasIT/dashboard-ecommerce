import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../../pages/company-manager/user/user.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { Catalog } from '../../../interfaces/product';
import { UserAuthPayload } from '../../../interfaces/auth';
import { AuthService } from '../../auth.service';
import { Company } from '../../../interfaces/company';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  GLOBALAPIURL = environment.GLOBALAPIURL;
  payload: UserAuthPayload | null = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {
    authService.currentTokenPayload.subscribe(res => this.payload = res)
  }
  getCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(`${this.GLOBALAPIURL}company/all`, {
      headers: this.authService.getAuthHeaders(),
    });
  }
}