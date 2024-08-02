import { Component, OnInit, ViewChild, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Category } from '../../interfaces/product';
import { SupabaseService } from '../../services/supabase/supabase.service';
import { debounceTime, distinctUntilChanged, Subscription } from 'rxjs';
import { CategoryModalComponent } from "../category-modal/category-modal.component";
import { CategoryService } from '../../services/supabase/category.service';
import { CdkMenuModule } from '@angular/cdk/menu'
import { DeletCheckComponent } from "../delet-check/delet-check.component";

import { CategoryService as ApiCategoryService} from '../../services/global-api/category.service';

@Component({
    selector: 'app-category-explore',
    standalone: true,
    templateUrl: './category-explore.component.html',
    styleUrl: './category-explore.component.css',
    imports: [CommonModule, ReactiveFormsModule, CategoryModalComponent, CdkMenuModule, DeletCheckComponent]
})
export class CategoryExploreComponent implements OnInit {
  searcherCategory:FormControl<string | null> = new FormControl<string>('');
  categories: Category[] | null = null;
  private categorySubscription: Subscription = new Subscription();
  
  selectedCategory: string = '';
  selectedCategoryId!: number | null ;
  chilCategorys: Category[] | null = null;
  selectedSubCategory: string = '';
  categoryId!: number ;
  categoryName!: string ;
  @ViewChild(CategoryModalComponent) CategoryModalComponent!: CategoryModalComponent;
  @ViewChild(DeletCheckComponent) deletCheckComponent!: DeletCheckComponent;

  editCategory(categoryId: number): void {
    this.selectedCategoryId = categoryId;
    this.CategoryModalComponent.isOpen = true;

    this.CategoryModalComponent.setCategoryId(categoryId)
  }

 

  deleteCategory(category: Category) {
    const name = category.label
    if(category && name){
      this.categoryName = name;
      this.categoryId = category.id;
      this.deletCheckComponent.openDialog()
    }
  }




  constructor(
    private supaBase: SupabaseService,
    private categoryServ: CategoryService,
    private categoryApiServ: ApiCategoryService  ) {
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
          await this.resetSelect(); 
        });
        
    }

  ngOnInit() {
    this.getAllCategory()
    this.categorySubscription = this.categoryApiServ.category.subscribe((res: Category[]) => {
      this.categories = res;
      console.log(this.categories)
    });
  }


  getCategories(category: string, isFather?: boolean){
    if(!isFather){
      this.selectedSubCategory = category;
    }
    this.supaBase.fetchByCategory(category)

  }

  removeFilters(){
    this.selectedSubCategory = '';
    this.selectedCategory = '';
   
    const details = document.querySelectorAll("details")
    details.forEach((item) => {
      if(item.open){
        item.open = false
      }
    });

    this.supaBase.fetchAllProducts()
  }

  getProducts(category: string){
    this.selectedSubCategory = ''
    this.getCategories(category, true)
    this.selectedCategory = category;
    console.log(category, 'getProducts ')
    this.getChillCategory(category);
  }

  resetSelect() {
    this.selectedCategory = '';
  }

  async getAllCategory(){
    try {
      this.categoryApiServ.fetchCategories()
    } catch (error) {
      console.log('Error al cargar categorías', error);
    }
  }

  async getChillCategory(categoryName: string){
    try {
      this.chilCategorys = await this.categoryServ.getCategoriesChildren(categoryName);
    } catch (error) {
      console.log('Error al cargar categorías', error);
    }
  }

   handleGetCategories(){
    setTimeout(()=>{
      this.getAllCategory()
      this.resetSelect()
    },1000)
  }

  async getCategoryByName(query:string){
    try {
      this.categories = await this.supaBase.fetchCategoryByName(query);
    } catch (error) {
      console.log('Error al cargar categorías', error);
    }
  }

}
