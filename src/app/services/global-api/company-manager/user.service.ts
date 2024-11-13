import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../../pages/company-manager/user/user.component';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { Catalog } from '../../../interfaces/product';
import { UserAuthPayload } from '../../../interfaces/auth';
import { AuthService } from '../../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  GLOBALAPIURL = environment.GLOBALAPIURL;
  payload: UserAuthPayload | null = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {
    authService.currentTokenPayload.subscribe(res => this.payload = res)
  }


  getUsersByCompany(): Observable<User[]> {
    console.log(this.payload, 'payload')
    return this.http.get<User[]>(`${this.GLOBALAPIURL}user/company/${this.payload?.user.companyId}`, {
      headers: this.authService.getAuthHeaders(),
    });
  }

  addUser(companyId: string, user: User): Observable<User> {
    const filteredBody = Object.fromEntries(
      Object.entries(user).filter(([_, value]) => value !== '')
    );
    return this.http.post<User>(`${this.GLOBALAPIURL}auth/register/${companyId}`, filteredBody , {
      headers: this.authService.getAuthHeaders()
    });
  }

  removeUser(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.GLOBALAPIURL}user/${userId}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  updateUser(userId: string, user: User) {
    const filteredBody = Object.fromEntries(
      Object.entries(user).filter(([_, value]) => value !== '')
    );
    return this.http.patch<User>(`${this.GLOBALAPIURL}user/${userId}`, filteredBody, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getCatalogs(companyId?: number): Observable<Catalog[]> {
    let params = new HttpParams();
    if (companyId) {
      params = params.set('companyId', companyId);
    }
  
    return this.http.get<Catalog[]>(`${this.GLOBALAPIURL}catalogs`, { params, headers: this.authService.getAuthHeaders(), });
  }
  

  addCatalog(catalog: Catalog): Observable<Catalog> {
    return this.http.post<Catalog>(`${this.GLOBALAPIURL}catalogs`, catalog, {
      headers: this.authService.getAuthHeaders()
    });
  }

  removeCatalog(catalogId: string): Observable<void> {
    return this.http.delete<void>(`${this.GLOBALAPIURL}catalogs/${catalogId}`, {
      headers: this.authService.getAuthHeaders()
    });
  }
}
