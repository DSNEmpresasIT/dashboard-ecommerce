import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { Company } from '../../../interfaces/company';
import { CompanyService } from './company.service';
import { AlertService, AlertsType } from '../../alert.service';

@Injectable({
  providedIn: 'root',
})
export class DataSharingService {
  private companyData = new BehaviorSubject<any>(null);
  companyData$ = this.companyData.asObservable();

  constructor(private companyServ: CompanyService, private alertService: AlertService){}

  setCompanyData(data: any) {
    this.companyData.next(data);
  }

  async refreshCompanyData() {
    try {
      const response = await firstValueFrom(this.companyServ.getCompany());
      this.setCompanyData(response);  
      return response; 
    } catch (error) {
      this.alertService.show(4000, "Se produjo un error al obtener la información", AlertsType.ERROR);
      throw error; 
    }
  }

}