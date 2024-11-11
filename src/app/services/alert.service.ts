import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import Swal, { SweetAlertOptions } from 'sweetalert2';

export enum AlertsType {
  ERROR = 'error',
  SUCCESS = 'success',
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private showAlertSubject = new Subject<{ duration: number; message: string; type: AlertsType }>
  showAlert$ = this.showAlertSubject.asObservable();

  constructor() { }

  show(duration: number, message: string, type: AlertsType) {
    this.showAlertSubject.next({ duration, message, type });
  }
  private darkTheme: SweetAlertOptions = {
    background: '#2f2f2f',
    color: '#ffffff',
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    iconColor: '#f39c12',
  };
  // Método específico para confirmar la eliminación
  async showDeleteConfirmation(onConfirm: () => void): Promise<void> {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      background: 'rgb(57 53 82 / var(--tw-bg-opacity))',
      color: '#fff',
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    })
    if(result.isConfirmed) {
      onConfirm()
    }
  }
}
