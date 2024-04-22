import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { AlertService, AlertsType } from '../alert.service';
import { PostgrestResponse, SupabaseClient, createClient } from '@supabase/supabase-js';
import { Category, selecdedCategories } from '../../interfaces/product';

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
      .is('father_category', 'null');
      return response.data as Category[] | null
    } catch (error) {
      console.error('Categorias padres no encontradas',  error)
        return null;
    }
  }

  async getAllChildrenCategories(): Promise<Category[] | null> { 
    try {
      const response = await this.supabase
      .from('categories')
      .select('*')
      .not('father_category','is' ,'null');
      return response.data as Category[] | null
    } catch (error) {
      console.error('Categorias padres no encontradas',  error)
        return null;
    }
  }

  async getChildrenCategories(fatherCategoryId : number): Promise<Category[] | null>{
    try {
      const response = await this.supabase
      .from('categories')
      .select('*')
      .eq('father_category', fatherCategoryId)
      return response.data as Category[] | null
    } catch (error) {
      console.error('Categorias hijas no encontradas',  error)
        return null;
    }
  }


  async addCategory(category : Category ): Promise<Category | null >{
    try {
      const response = await this.supabase
        .from('categories')
        .insert({ category })

        return response.data 
    } catch (error) {
        return null
    }
  }

  async editProductCategory(product_id:number | undefined , category_id: number){
    try {
      const response = await this.supabase
      .from('products_categories')
      .update({ category_id })
      .eq('category_id', category_id)
      .eq('product_id', product_id)
      return response.data 
    } catch (error) {
      console.error('Error al editar la categoria del producto', error)
      return null
    }
  }
  

  async fetchCategoryOfOneProduct(productId: number): Promise<selecdedCategories | null | undefined> {
    try {
      const { data, error } = await this.supabase
        .from('products_categories')
        .select('category_id')
        .eq('product_id', productId)
      if (data && data.length > 0) {
        const categoryIds = data.map(item => item.category_id);
        const { data: categoryData , error: categoryError } : PostgrestResponse<Category> = await this.supabase
          .from('categories')
          .select('*')
          .is('father_category', null)
          .in('id', categoryIds);
          const { data: subCategory, error: subCategoryError } :  PostgrestResponse<Category>= await this.supabase
          .from('categories')
          .select('*')
          .not('father_category', 'is', null)
          .in('id', categoryIds);

        if (categoryData  && categoryData.length > 0) {
          console.log(categoryData[0], 'Categoría obtenida en return')

          const selectedCategoriess: selecdedCategories = {
            category: categoryData,
            subCategory: subCategory
          }
          console.log(selectedCategoriess,' CAtegorias seleccionada')
          return selectedCategoriess;
        } else if (categoryError) {
          console.log('Error fetching category:', categoryError);
          return null;
        }
      } else if (error) {
        console.log('Error fetching category ID:', error);
        return null;
      }

      return undefined; // Add the return statement at the end of the function
    } catch (error) {
      console.log('Error fetching category:', error);
      return null;
    }
  }

}
