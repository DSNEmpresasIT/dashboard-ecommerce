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
  // Método específico para confirmar la eliminación
  async showConfirmation(onConfirm: () => void, title = "¿Estás seguro?", message?: string): Promise<void> {
    const result = await Swal.fire({
      title,
      icon: "warning",
      text: message,
      background: 'rgb(57 53 82 / var(--tw-bg-opacity))',
      color: '#fff',
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      confirmButtonText: "Aceptar",
    })
    if(result.isConfirmed) {
      onConfirm()
    }
  }
  /**
   * Validacion por input para realizar el DELETE
   * @param onConfirm 
   */
  async showConfirmationWithValidation(onConfirm: () => void) {
    const validateText = 'DELETE'
    Swal.fire({
      title: "Para eliminar, escriba DELETE",
      input: "text",
      color: "#fff",
      inputAttributes: {
        autocapitalize: "off",
      },
      customClass: {
        htmlContainer: "rgb(57 53 82 / var(--tw-bg-opacity))",
        input: 'text-Text p-3 px-8 rounded-lg bg-Base hover:border-Pine'
      },
      background: 'rgb(57 53 82 / var(--tw-bg-opacity))',
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      confirmButtonText: "Aceptar",
      showLoaderOnConfirm: true,
      preConfirm: async (text) => {
        try {
          if(text === validateText) {
            return 'OK'
          } 
          return Swal.showValidationMessage(`
            ${JSON.stringify("tes")}
          `);
        } catch (error) {
          Swal.showValidationMessage(`
            Request failed: ${error}
          `);
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Éxito!",
          text: 'Eliminación exitosa',
          icon: "info",
          color: "#fff",
          showClass: {
            popup: 'bg-Overlay',
          },
        });
      }
    });
  }
}
