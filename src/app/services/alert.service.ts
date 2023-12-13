import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export enum AlertsType {
  ERROR = 'error',
  SUCCESS = 'success',
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private showAlertSubject = new Subject<{duration: number; message: string; type: AlertsType}>
  showAlert$ = this.showAlertSubject.asObservable();

  constructor() { }

  show(duration: number, message: string , type: AlertsType) {
    this.showAlertSubject.next({ duration, message, type });
  }
}
