import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { AlertService, AlertsType } from '../alert.service';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { Category } from '../../interfaces/product';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  supabaseUrl = environment.MAIN_SUPABASE_URL;
  supabaseKey = environment.MAIN_SUPABASE_KEY;
  private supabase: SupabaseClient;

  constructor(private alertServ: AlertService) {
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
  }


  async getAllFhaterCategories(): Promise<Category[] | null> { 
    try {
      const response = await this.supabase
      .from('categories')
      .select('*')
      .is('fhater_categories', 'null');

      return response.data as Category[] | null
    } catch (error) {
      console.error('Categorias padres no encontradas',  error)
        return null;
    }
 
  }


}
