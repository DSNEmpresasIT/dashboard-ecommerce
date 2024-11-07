import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../../pages/company-manager/user/user.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { Catalog } from '../../../interfaces/product';
import { UserAuthPayload } from '../../../interfaces/auth';
import { AuthService } from '../../auth.service';

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

  addUser(user: User): Observable<User> {
    return this.http.post<User>(`${this.GLOBALAPIURL}auth/register/${user.id}`, user);
  }

  removeUser(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.GLOBALAPIURL}auth/remove-user/${userId}`);
  }

  getCatalogs(): Observable<Catalog[]> {
    return this.http.get<Catalog[]>(`${this.GLOBALAPIURL}catalogs`);
  }

  addCatalog(catalog: Catalog): Observable<Catalog> {
    return this.http.post<Catalog>(`${this.GLOBALAPIURL}catalogs`, catalog);
  }

  removeCatalog(catalogId: string): Observable<void> {
    return this.http.delete<void>(`${this.GLOBALAPIURL}catalogs/${catalogId}`);
  }
}
