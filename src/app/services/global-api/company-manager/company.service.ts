import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../../pages/company-manager/user/user.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { Catalog } from '../../../interfaces/product';
import { UserAuthPayload } from '../../../interfaces/auth';
import { AuthService } from '../../auth/auth.service';
import { Company } from '../../../interfaces/company';
import { CompanyFormData } from '../../../interfaces/data';
import { CreateCompanyDto } from '../../../interfaces/companyDTO';

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

  getCompany(companyId:number | undefined = this.payload?.user.companyId ): Observable<Company> {
    return this.http.get<Company>(`${this.GLOBALAPIURL}company/${companyId}`,{
      headers: this.authService.getAuthHeaders(),
    })
  }

  create(company:Company){
   
  }

  update(company: CreateCompanyDto){
    const id = company.keys?.email_keys?.id;
    
    if (company.keys?.email_keys) {
      const numericId = Number(id);
  
      if (!isNaN(numericId)) {
        company.keys.email_keys.id = numericId;
      } else {
        delete company.keys.email_keys.id;
      }
    }
    console.log(company, 'company update');
    return this.http.put<Company>(`${this.GLOBALAPIURL}company/${company.id}`,{...company},{
      headers: this.authService.getAuthHeaders(),
    })
  }

  createCompanyCredentials(){

  }

  editCompanyCredentials(){
    
  }
}
