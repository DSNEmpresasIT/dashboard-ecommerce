import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { PostgrestError, PostgrestSingleResponse, SupabaseClient, createClient } from '@supabase/supabase-js';
import { BehaviorSubject, Subject } from 'rxjs';
import { Category, Product } from '../../interfaces/product';
import { AlertService, AlertsType } from '../alert.service';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  supabaseUrl = environment.MAIN_SUPABASE_URL;
  supabaseKey = environment.MAIN_SUPABASE_KEY;
  private supabase: SupabaseClient;

  constructor(private alertServ: AlertService) {
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
  }

  private productsSubject = new BehaviorSubject<Product[]>([]);
  products = this.productsSubject.asObservable();

  private editProductSubject = new BehaviorSubject<Product | null>(null);
  editProduct = this.editProductSubject.asObservable();

  private updateNotifier = new Subject<void>();
  updateNotification$ = this.updateNotifier.asObservable();

  private selectedCategory = new BehaviorSubject<string>('');
  private lastQuery = new BehaviorSubject<string>("");

 

  async updateProducts() {
    const config = [
      { condition: () => this.selectedCategory.value, action: this.fetchByCategory.bind(this) },
      { condition: () => this.lastQuery.value, action: this.fetchProductsByName.bind(this) },
      { condition: () => true, action: this.fetchAllProducts.bind(this) }
    ];
  
    try {
      const { action } = config.find(item => item.condition()) || {};
      if (action) {
        await action();
      }
    } catch (error) {
      console.error('Error al actualizar productos:', error);
    }
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
        this.selectedCategory.next('')
      }
    } catch (error) {
       console.log('error', error)
    }
  }

  async fetchProductsByName(productName: string = this.lastQuery.value) {
    try {
      const productResponse = await this.supabase
        .from('products')
        .select('*')
        .ilike('name', `%${productName}%`);
        
        this.lastQuery.next(productName)
        this.selectedCategory.next('')
      if (productResponse.data) {
        this.updateNotifier.next();
        this.productsSubject.next(productResponse.data);
      }
    } catch (error) {
      console.log('error', error);
    }
  }
  
  async fetchByCategory(category:string = this.selectedCategory.value) {
    try {
      // Paso 1: Obtener el ID de la categoría 'Fertilizantes'
      const categoryResponse = await this.supabase
        .from('categories')
        .select('id')
        .ilike('category', `%${category}%`);
        if (categoryResponse.data && categoryResponse.data.length > 0) {
          this.selectedCategory.next(category);
        }
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

  // metodos para agregar 

  async newProduct(product: Product, category_id: string): Promise<Product | null> {
    if (!category_id) {
      console.error('Error: category_id is required.');
      return null;
    }
  
    try {
      // Primero, inserta el producto en la tabla productos
      const { error } = await this.supabase
        .from('products')
        .insert([product]);
  
      if (error) {
        console.error('Error inserting product:', error);
        return null;
      }
  
      // Busca el producto recién insertado por nombre
      const {data} = await this.supabase
        .from('products')
        .select('*')
        .ilike('name', `%${product.name}%`);
  
      // Obtiene el ID del producto insertado
      const newProduct = data?.find((item) => item.name === product.name);
      const productId = newProduct?.id;

      console.log(productId, 'ID del producto');
  
      if (productId) {
        // Asocia el producto a la categoría en la tabla 'products_categories'
        const { error: categoryError } = await this.supabase
          .from('products_categories')
          .upsert([
            {
              category_id: category_id,
              product_id: productId
            }
          ]);
  
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
  

  async deleteProduct(id: number | undefined): Promise<PostgrestError | null>  {
    try {
       const response = await this.supabase
          .from('products_categories')
          .delete()
          .eq('product_id', id);
          
          if (response.error) {
             throw new Error(response.error.message);
          }
          this.alertServ.show(6000, "Producto Eliminado con exito.", AlertsType.SUCCESS)
          return response.data;
        } catch (error) {
          this.alertServ.show(6000, "El producto no se pudo eliminar", AlertsType.ERROR)
          console.error('Error al eliminar el producto:', error);
          return null      
    }   
 }  
 

}
