import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { BehaviorSubject, Subject } from 'rxjs';
import { Category, Product } from '../interfaces/product';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  supabaseUrl = environment.SUPABASEURL;
  supabaseKey = environment.SUPABASEKEY;
  private supabase: SupabaseClient;

  private productsSubject = new BehaviorSubject<Product[]>([]);
  products = this.productsSubject.asObservable();

  private editProductSubject = new BehaviorSubject<Product | null>(null);
  editProduct = this.editProductSubject.asObservable();

  private updateNotifier = new Subject<void>();
  updateNotification$ = this.updateNotifier.asObservable();

  constructor() {
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
  }

async getProductById(id: number | undefined) {
  try {
    const { data, error } = await this.supabase
      .from('products')
      .select('*')
      .eq('id', id);
    if (data && data.length > 0) {
      this.editProductSubject.next(data[0]);
    } else if (error) {
      console.log('Error fetching product by ID:', error);
    }
  } catch (error) {
    console.log('Error:', error);
  }
}


  async updateProduct(product: Product): Promise<{ data: any, error: any }> {
    try {
      const result = await this.supabase
        .from('products')
        .update(product)
        .eq('id', product.id);

      return result;
    } catch (error) {
      console.error('Error al realizar la actualización en Supabase:', error);
      throw error;
    }
  }


  async fetchAllCategories(): Promise<Category[] | null> {
    try {
      const categoriesResponse = await this.supabase
        .from('categories')
        .select('*');
      return categoriesResponse.data as Category[] | null;
    } catch (error) {
      console.log('Categorías no encontradas', error);
      return null;
    }
  }
  
  async fetchCategoryByName(query:string): Promise<Category[] | null> {
    try {
      const categoriesResponse = await this.supabase
        .from('categories')
        .select('*')
        .ilike('category', `%${query}%`);
        const categories = categoriesResponse.data as Category[] | null;
        return categories;
    } catch (error) {
      console.log('Categorías no encontradas', error);
      return null;
    }
  }

  async fetchAllProducts(){
    try {
      const productResponse = await this.supabase
      .from('products')
      .select('*');
      if(productResponse.data){
        this.productsSubject.next(productResponse.data);
      }
    } catch (error) {
       console.log('error', error)
    }
  }

  async fetchProductsByName(productName: string) {
    try {
      const productResponse = await this.supabase
        .from('products')
        .select('*')
        .ilike('name', `%${productName}%`);
      if (productResponse.data) {
        this.updateNotifier.next(); 
        this.productsSubject.next(productResponse.data);
      }
    } catch (error) {
      console.log('error', error);
    }
  }
  
  async fetchByCategory(category:string) {
    try {
      // Paso 1: Obtener el ID de la categoría 'Fertilizantes'
      const categoryResponse = await this.supabase
        .from('categories')
        .select('id')
        .ilike('category', `%${category}%`);
  
      if (categoryResponse.data) {
        const categoryId = categoryResponse.data[0]?.id;
  
        if (categoryId) {
          // Paso 2: Usar el ID de la categoría en la consulta de productos
          const { data, error } = await this.supabase
            .from('products_categories')
            .select('product_id')
            .eq('category_id', categoryId);
  
          if (data) {
            // Mapea los IDs de productos
            const productIds = data.map(item => item.product_id);
  
            // traer todos los productos con las ids buscadas en products_categories 
            const productDetails = await this.supabase
              .from('products')
              .select('*')
              .in('id', productIds);
  
            if (productDetails.data) {
              this.productsSubject.next(productDetails.data);
            }
          }
        }
      }
    } catch (error) {
      console.log('Error', error);
    }
  }
  
}
