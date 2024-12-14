import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { UserAuthPayload } from '../../interfaces/auth';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class FilesService {
  GLOBALAPIURL = environment.GLOBALAPIURL;
  payload: UserAuthPayload | null = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {
    authService.currentTokenPayload.subscribe(res => this.payload = res)
  }
  uploadFile(file: FormData) {
    return this.http.post(`${this.GLOBALAPIURL}files`, file)
  }
  deleteFileById(companyId: number, imageId: number) {
    return this.http.delete(`${this.GLOBALAPIURL}files/${companyId}/${imageId}`, {
      headers: this.authService.getAuthHeaders(),
    });
  }
}
