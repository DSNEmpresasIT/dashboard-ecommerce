import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { ProductFeature } from '../../interfaces/productSingle';
import { AlertService, AlertsType } from '../alert.service';

@Injectable({
  providedIn: 'root'
})
export class ProductSingleService {

  supabaseUrl = environment.MAIN_SUPABASE_URL;
  supabaseKey = environment.MAIN_SUPABASE_KEY;

  private supabase: SupabaseClient;

  constructor(private alertServ: AlertService) {
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
  }

  getProductSingleById = async (id: string): Promise<ProductFeature | null> => {
    try {
      const { data, error } = await this.supabase
        .from('productFeature')
        .select('*')
        .eq('product_id', id);
  
      if (error) {
        console.error('Error fetching data:', error);
        return null;
      }
      if (data && data.length > 0) {
        return data[0] as ProductFeature;
      } else {
        console.warn('No product found with ID:', id);
        return null;
      }
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  };
  

  async updateProductSingle(productSingle: ProductFeature): Promise<{ data: any, error: any }> {
    try {
      const result = await this.supabase
        .from('productFeature')
        .update(productSingle)
        .eq('id', productSingle.id);
      if(result){
        console.log(result)
        this.alertServ.show(6000, "Detalle de producto actualizado con exito.", AlertsType.SUCCESS)
      }
      return result;
    } catch (error) {
      this.alertServ.show(6000, "El detalle de producto no pudo ser actualizado", AlertsType.ERROR)
      console.error('Error al realizar la actualización en Supabase:', error);
      throw error;
    }
  }
}
