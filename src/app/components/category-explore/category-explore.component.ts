import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Category } from '../../interfaces/product';
import { SupabaseService } from '../../services/supabase/supabase.service';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { CategoryModalComponent } from "../category-modal/category-modal.component";

@Component({
    selector: 'app-category-explore',
    standalone: true,
    templateUrl: './category-explore.component.html',
    styleUrl: './category-explore.component.css',
    imports: [CommonModule, ReactiveFormsModule, CategoryModalComponent]
})
export class CategoryExploreComponent {
  searcherCategory:FormControl<string | null> = new FormControl<string>('');
  categories: Category[] | null = null;
  selectedCategory: string = '';


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
      this.supaBase.updateNotification$.subscribe(async () => {
        await this.resetSelect(); // Esperar a que resetSelect se complete
      });
      
   }

  ngOnInit() {
    this.getAllCategory()

  }

  getProducts(category: string){
    this.supaBase.fetchByCategory(category)
    this.selectedCategory = category;
  }

  resetSelect() {
    console.log('Resetting selectedCategory');
    this.selectedCategory = '';
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
