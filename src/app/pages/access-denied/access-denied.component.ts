import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ContactInfo } from '../../enums/enums';

@Component({
  standalone: true,
  selector: 'app-access-denied',
  template: `
    <div class="flex flex-col items-center justify-center h-screen bg-Base text-Text text-center">
      <h1 class="text-4xl font-bold text-red-400 mb-4">Acceso Denegado</h1>
      <p class="mb-4">No tienes permisos para acceder a esta página.</p>
      <p class="text-sm mb-8">
        Esta sección está reservada para administradores de <strong>DSN Empresas</strong>. Si necesitas acceso,
        contacta con el soporte de tu empresa.
      </p>
      
      <button
        (click)="goHome()"
        class="px-4 py-2 bg-Pine/70 text-white rounded-lg hover:bg-Pine transition mb-4"
      >
        Volver al Inicio
      </button>

      <div class="text-sm text-gray-500">
        ¿Necesitas ayuda? Contacta a nuestro equipo de soporte:
        <br>
        <div class="flex flex-col ">
          <div class="gap-2">
            <a class="group" href="tel:{{ ContactInfo.SupportPhone }}">
              <span class="font-semibold text-Pine/80 group-hover:text-Pine">Teléfono:</span>
              <span class=" group-hover:text-Pine">
                {{ ContactInfo.SupportPhone }}
              </span>
            </a>
          </div>

          <div class="gap-2">
            <a class="group" href="mailto:{{ ContactInfo.SupportEmail }}">
              <span class="font-semibold text-Pine/80 group-hover:text-Pine">Email:</span>
              <span class=" group-hover:text-Pine">
                {{ ContactInfo.SupportEmail }}
              </span>
            </a>
          </div>

          <div class="gap-2">
            <a class="group" href="https://wa.me/{{ ContactInfo.SupportWhatsApp }}">
              <span class="font-semibold text-Pine/80 group-hover:text-Pine">WhatsApp:</span>
              <span class=" group-hover:text-Pine">
                {{ ContactInfo.SupportPhone }}
              </span>
            </a>
          </div>
        </div>

      </div>

    </div>
  `,
  styles: [],
})
export class AccessDeniedComponent {
  ContactInfo = ContactInfo;
  constructor(private router: Router) {}

  goHome() {
    this.router.navigate(['/']);
  }
}
