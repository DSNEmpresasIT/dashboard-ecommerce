import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent {
  
  constructor(private authService: AuthService,  private router: Router) {}

  ngOnInit() {
  }

  email: string = '';
  password: string = '';

  login() {
    this.authService.login(this.email, this.password)
      .then((result) => {
        if (result) {
          this.router.navigate(['/']);
        }
      })
      .catch((error) => {
        console.error('Error al iniciar sesión:', error);
      });
  }
  
}
