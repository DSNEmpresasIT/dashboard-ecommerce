import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataSharingService {
  private companyData = new BehaviorSubject<any>(null);
  companyData$ = this.companyData.asObservable();

  setCompanyData(data: any) {
    this.companyData.next(data);
  }
}