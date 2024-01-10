import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { AlertService } from '../alert.service';
import { Supplier } from '../../interfaces/supplier';


@Injectable({
  providedIn: 'root'
})
export class SupplierService {

  supabaseUrl = environment.MAIN_SUPABASE_URL;
  supabaseKey = environment.MAIN_SUPABASE_KEY;
  private supabase: SupabaseClient;

  constructor(private alertServ: AlertService) {
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
  }


  async getSuppliers(): Promise<Supplier[] | null>{
    try {
      const response = await this.supabase
      .from('supplier')
      .select('*');
      console.log(response.data)
      console.log(response.error, 'error suppliers')
      return response.data as Supplier[] | null
    } catch (error) {
      console.log('Error al traer los provedores', error);
      return null;
    }
  }

}
