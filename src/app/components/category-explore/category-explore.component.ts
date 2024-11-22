import { Component, effect, OnInit, Signal, ViewChild, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Category } from '../../interfaces/product';
import { SupabaseService } from '../../services/supabase/supabase.service';
import { debounceTime, distinctUntilChanged, Subscription } from 'rxjs';
import { CategoryModalComponent } from "../category-modal/category-modal.component";
import { CdkMenuModule } from '@angular/cdk/menu'
import { DeletCheckComponent } from "../delet-check/delet-check.component";
import { CategoryService} from '../../services/global-api/catalog/category.service';
import { DeletTypes } from '../../enums/enums';
import { deleteConfig } from '../../interfaces/interfaces';
import { CategoryTreeComponent } from "../category-tree/category-tree.component";
import { CategoryTreeService, SelectedCategory } from '../../services/category-tree.service';
import { ModalService } from '../../services/modal-new-product.service';
import { ProductService } from '../../services/global-api/catalog/product.service';
import { RouterLink } from '@angular/router';
import { CatalogStateService } from '../../services/global-api/catalog/catalog-state.service';

@Component({
    selector: 'app-category-explore',
    standalone: true,
    templateUrl: './category-explore.component.html',
    styleUrl: './category-explore.component.css',
    imports: [CommonModule, ReactiveFormsModule, CategoryModalComponent, CdkMenuModule, DeletCheckComponent, CategoryTreeComponent, RouterLink]
})
export class CategoryExploreComponent implements OnInit {
  DeletTypes: DeletTypes = DeletTypes.CATEGORY;
  catalogId: string | null = null

  searcherCategory:FormControl<string | null> = new FormControl<string>('');
  categories$ = this.categoryServ.categories$;
  selectedCategoriesSignal: Signal<SelectedCategory[]>;
  

  selectedCategory: string = '';
  selectedCategoryId!: number | null ;
  chilCategorys: Category[] | null = null;
  selectedSubCategory: string = '';
  categoryId!: number;
  categoryName!: string ;
  @ViewChild(CategoryModalComponent) CategoryModalComponent!: CategoryModalComponent;



  removeCategory(category?: SelectedCategory): void {
    if(!category){
      this.categoryTreeServ.setSelectedCategories([]);
    }
    const currentCategories = this.selectedCategoriesSignal();
    const updatedCategories = currentCategories.filter(cat => cat.id !== category?.id);
    
    this.categoryTreeServ.setSelectedCategories(updatedCategories);
  }

  constructor(
    private productServ: ProductService,
    private categoryServ: CategoryService,
    private categoryTreeServ: CategoryTreeService,
    private modalToggleService: ModalService,
    private catalogState: CatalogStateService
  ) {
      this.selectedCategoriesSignal = this.categoryTreeServ.selectedCategoriesSignal;

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
        effect(() => {
          let value = this.selectedCategoriesSignal();
          console.log('hubo cambios ', value);
        
          if (value.length > 0) {
            const lastCategory = value[value.length - 1];
            const lastCategoryId = lastCategory.id;
        
            this.productServ.fetchProductByCategoryId(lastCategoryId);
          } else {
            this.productServ.fetchAllProducts();
          }
        });
        
        this.catalogState.catalogId$.subscribe(id => {
          this.catalogId = id;
        });
        
    }
    
  ngOnInit() {
    this.getAllCategory()
   
  }


  getCategories(category: Category, isFather?: boolean) {
    if (!isFather) {
      this.selectedSubCategory = category.label;
    }
  
    this.categoryServ.fetchCategories(category.id).subscribe((res: Category[]) => {

      const selectedCategory = res
      if (selectedCategory && selectedCategory) {
        this.chilCategorys = selectedCategory;
        console.log(this.chilCategorys, 'llamando sub categories');
      } else {
        console.log('No subcategories found');
      }
    }, (error) => {
      console.error('Error fetching subcategories', error);
    });
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

    this.productServ.fetchAllProducts()
  }

  getProducts(category: Category){
    if(category){
      this.selectedSubCategory = ''
      this.getCategories(category, true)
      this.selectedCategory = category.label;
    }
    
    console.log(category, 'getProducts ')
  }

  resetSelect() {
    this.selectedCategory = '';
  }

  getAllCategory(){
     this.categoryServ.fetchCategories().subscribe()
  }

  // async getChillCategory(categoryName: string) {
  //   try {
  //     this.categoryServ.fetchCategories(parseInt(categoryName)).subscribe((res) => 
  //       this.chilCategorys = res);
  //   } catch (error) {
  //     console.log('Error loading subcategories:', error);
  //   }
  // }

  // handleGetCategories(){
  //   setTimeout(()=>{
  //     this.getAllCategory()
  //     this.resetSelect()
  //   },1000)
  // }

  async getCategoryByName(query:string){
    try {
    //  this.categories = await this.supaBase.fetchCategoryByName(query);
    } catch (error) {
      console.log('Error al cargar categorías', error);
    }
  }
  

  toggleModal(){
    this.CategoryModalComponent.openDialog()
    this.CategoryModalComponent.loadFatherCategories()
  }
  
  toggleModalNewProduct() {
    this.modalToggleService.toggleModal(true); 
  }
}
