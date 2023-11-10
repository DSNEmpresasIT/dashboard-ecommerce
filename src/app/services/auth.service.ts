import { Injectable } from '@angular/core';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment.development';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  supabaseUrl = environment.SUPABASEURL;
  supabaseKey = environment.SUPABASEKEY;

  private supabase: SupabaseClient;
  isLoggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor() {
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
    this.checkToken();
  }

 
  async checkToken() {
    try {
      const { error } = await this.supabase.auth.getUser(); // Verificar el token
      if (error) {
        this.isLoggedIn.next(false); // Si el token no es válido, cierra la sesión
      } else {
        this.isLoggedIn.next(true); // Si el token es válido, el usuario está autenticado
      }
    } catch (error) {
      console.error('Error al verificar el token:', error);
      this.isLoggedIn.next(false); // Manejar errores y cerrar la sesión
    }
  }
  
  async login(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Error al iniciar sesión:', error);
    } else {
      this.isLoggedIn.next(true); 
    }

    return { data, error };
  }
  async logout() {
    await this.supabase.auth.signOut();
    this.isLoggedIn.next(false); 
  }
}
