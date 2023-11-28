import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { Product } from '../../interfaces/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  supabaseUrl = environment.MAIN_SUPABASE_URL;
  supabaseKey = environment.MAIN_SUPABASE_KEY;

  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
  }



  async newProduct(product: Product, category_id: string): Promise<Product | null> {
    if (!category_id) {
      console.error('Error: category_id is required.');
      return null;
    }
    try {
      // Primero, inserta el producto en la tabla productos
      const { data, error } = await this.supabase
        .from('products')
        .insert([product]) as { data: Product[] | null, error: any };
  
      if (error) {
        console.error('Error inserting product:', error);
        return null;
      }
  
      // Obtiene el ID del producto insertado
      const productId = data && data.length > 0 ? data[0].id : null;
  
      if (productId) {
        // Asocia el producto a la categoría en la tabla 'products_categories'
        const { error: categoryError } = await this.supabase
          .from('products_categories')
          .upsert([
            {
              category_id: category_id,
              product_id: productId
            }
          ], { onConflict: 'product_id' }); // onConflict se fija si hay un product_id ya relacionado
  
        if (categoryError) {
          console.error('Error associating product with category:', categoryError);
          return null;
        }
      }
  
      return productId ? { ...product, id: productId } : null;
    } catch (error) {
      console.error('Error adding product:', error);
      return null;
    }
  }

  

}
