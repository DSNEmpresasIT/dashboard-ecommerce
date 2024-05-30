import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { AlertService, AlertsType } from '../alert.service';
import { PostgrestResponse, SupabaseClient, createClient } from '@supabase/supabase-js';
import { Category, selecdedCategories } from '../../interfaces/product';
import { Observable, from } from 'rxjs';

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
        .insert( category )

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

  async editCategory(categoryID: number, dataToEdit: Category): Promise<Category | null> {
    try {
      console.log(categoryID, dataToEdit, 'send to supabase ')
      const { data, error }  = await this.supabase
        .from('categories')
        .update({
          'category':dataToEdit.category ,
          'father_category': dataToEdit.father_category,
          'is_substance_active': dataToEdit.is_substance_active
        })
        .eq('id', categoryID);
      if (error) {
        throw error;
      }
      this.alertServ.show(6000, 'categoria editada correctamente', AlertsType.SUCCESS);
      return data ? data[0] as Category : null;
    } catch (error) {
      console.log('Error:', error);
      this.alertServ.show(6000, 'Error al editar la categoria', AlertsType.ERROR);
      return null;
    }
  }

  async deleteCategory(categoryId: number): Promise<Category | null>{
    if(!categoryId) return null
    try {
      const {data, error} = await this.supabase
      .from('categories')
      .delete()
      .eq('id', categoryId);
      console.log(data, 'data ondelet')
      this.alertServ.show(6000, 'Categoria borrada con exito', AlertsType.SUCCESS)
      return data
    } catch (error) {
      this.alertServ.show(6000, `No se pudo Borrar la categoria error: ${error}`, AlertsType.ERROR)
      return null
    }
  }


  getCategoryById(id: number): Observable<Category> {
    return from(this.supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .then(({ data, error }) => {
        if (error) {
          throw new Error(error.message);
        }
        return data ? data[0] : null; 
      }));
  }

  getCategoriesChildren = async (categoryFather: string): Promise<Category[] | null> => {

    const { data: parentCategory, error: parentError } = await this.supabase
      .from('categories')
      .select('id')
      .eq('category', categoryFather)
      .single();
  
    if (parentError) {
      console.error('Error obtaining parent category:', parentError.message);
      return null;
    }
  
    if (!parentCategory) {
      console.error('Parent category not found.');
      return null;
    }
  
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .eq('father_category', parentCategory.id);
  
    if (error) {
      console.error('Error when obtaining child categories:', error.message);
      return null;
    }
  
    return data;
  };
  
  getCategoriesFathers = async () : Promise<Category[] | null> => {
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .is('father_category', null);
  
    if (error) {
      console.error('Error when obtaining parent categories:', error.message);
      return null;
    }
  
    return data;
  };
  
}
