import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { AlertService, AlertsType } from '../alert.service';
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

  
  async getSupplierById(id: number | undefined) : Promise<Supplier | null> {
    try {
      const { data, error } = await this.supabase
        .from('supplier')
        .select('*')
        .eq('id', id);
        if(data){
          return data[0] as Supplier | null;
        }else 
        return null
    } catch (error) {
      console.log('Error:', error);
      return null;
    }
  }

  async createSupplier(supplier: Supplier): Promise<Supplier | null> {
    try {
      const { data, error } = await this.supabase
        .from('supplier')
        .insert([supplier]);
      if (error) {
        throw error;
      }
      this.alertServ.show(6000, 'Proveedor creado correctamente', AlertsType.SUCCESS);
      return data ? data[0] as Supplier : null;
    } catch (error) {
      console.log('Error:', error);
      this.alertServ.show(6000, 'Error al crear el proveedor', AlertsType.ERROR);
      return null;
    }
  }

  async editSupplier(supplier: Supplier): Promise<Supplier | null> {
    try {
      const { data, error } = await this.supabase
        .from('supplier')
        .update(supplier)
        .eq('id', supplier.id);
      if (error) {
        throw error;
      }
      this.alertServ.show(6000, 'Proveedor editado correctamente', AlertsType.SUCCESS);
      return data ? data[0] as Supplier : null;
    } catch (error) {
      console.log('Error:', error);
      this.alertServ.show(6000, 'Error al editar el proveedor', AlertsType.ERROR);
      return null;
    }
  }

}
