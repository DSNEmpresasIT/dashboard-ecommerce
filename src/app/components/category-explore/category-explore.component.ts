import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Category } from '../../interfaces/product';
import { SupabaseService } from '../../services/supabase.service';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-category-explore',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './category-explore.component.html',
  styleUrl: './category-explore.component.css'
})
export class CategoryExploreComponent {
  searcherCategory:FormControl<string | null> = new FormControl<string>('');
  categories: Category[] | null = null;
constructor(private supaBase: SupabaseService) {
    this.searcherCategory.valueChanges
    .pipe(
      debounceTime(600),
      distinctUntilChanged() 
      )
      .subscribe((query)=>
      {
        const queryString = query || '';
        if(query == ''){
          this.getAllCategory()
        }else {
          this.getCategoryByName(queryString)
        }
      })
   }

  ngOnInit() {
    this.getAllCategory()
  }

  getProducts(product:string){
    this.supaBase.fetchByCategory(product)
  }

  async getAllCategory(){
    try {
      this.categories = await this.supaBase.fetchAllCategories();
    } catch (error) {
      console.log('Error al cargar categorías', error);
    }
  }

  async getCategoryByName(query:string){
    try {
      this.categories = await this.supaBase.fetchCategoryByName(query);
    } catch (error) {
      console.log('Error al cargar categorías', error);
    }
  }

}
