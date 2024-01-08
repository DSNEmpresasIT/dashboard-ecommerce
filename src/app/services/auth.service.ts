import { Injectable } from '@angular/core';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment.development';
import { BehaviorSubject } from 'rxjs';
import { AlertService, AlertsType } from './alert.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabaseUrl: string = environment.MAIN_SUPABASE_URL;
  private supabaseKey: string = environment.MAIN_SUPABASE_KEY;
  private supabase: SupabaseClient;
  isLoggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    private alert:AlertService,
    private router: Router) {
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
    this.checkToken();
  }

  setSupabaseCredentials(url: string, key: string) {
    this.supabaseUrl = url;
    this.supabaseKey = key;
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
  }
 
  async checkToken() {
    try {
      const { data, error } = await this.supabase.auth.getUser(); // Verificar el token
      if (error) {
        this.isLoggedIn.next(false); // Si el token no es válido, cierra la sesión
        console.log(error, ' no auth')
      } else {
        this.isLoggedIn.next(true); // Si el token es válido, el usuario está autenticado
       
        this.onUserLoggedIn(data?.user?.id);
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
      this.onUserLoggedIn(data?.user?.id);
    }

    return { data, error };
  }
  async logout() {
    const {error} = await this.supabase.auth.signOut();
    this.isLoggedIn.next(false);
    if(error === null){
      this.alert.show(6000, 'Sesión cerrada con exito', AlertsType.SUCCESS)
      this.router.navigate(['/auth'])
    }else {
      this.alert.show(6000,`Error al cerrar sesión error:${error}`, AlertsType.ERROR)
    }
  }

  private onUserLoggedIn(userId: string | undefined) {
    const userConfig = this.findUserConfig(userId);
    if (userConfig) {
      this.setSupabaseCredentials(userConfig.SUPABASE_URL, userConfig.SUPABASE_KEY);
    }
  }

  private findUserConfig(userId: string | undefined) {
    const users = environment.USERS;
    for (const key in users) {
      if (users.hasOwnProperty(key) && users[key].USER_ID === userId) {
        return users[key];
      }
    }
    return null;
  }


}
