import { AfterViewInit, Component, Input, OnInit, Signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryTreeService } from '../../services/category-tree.service';
import { CategoryModalComponent } from "../category-modal/category-modal.component";
import { DeletCheckComponent } from "../delet-check/delet-check.component";
import { DeletTypes } from '../../enums/enums';
import { deleteConfig } from '../../interfaces/interfaces';
import { Category } from '../../interfaces/product';
import { CategoryService } from '../../services/global-api/category.service';
import { CdkMenuModule } from '@angular/cdk/menu';
export interface CategoryTreeDTO {
  id: number;
  label: string;
  childrens?: CategoryTreeDTO[];
  selected?: boolean;
  showChildren?: boolean;
}
@Component({
  selector: 'app-category-tree',
  standalone: true,
  imports: [CommonModule, CategoryModalComponent, DeletCheckComponent,CdkMenuModule],
  template: `
  @if(categories){
    <ul class="ml-4">
      @for (category of categories; track $index) {
      <li class="mb-2">
        <summary  class="flex  justify-between transition-colors duration-300 hover:bg-Overlay p-1 rounded-lg group/bg items-center">
          <div  (click)="toggleChildren(category)" class="group/title w-full cursor-pointer">
            <span  class="cursor-pointer mr-2">
              <i class="transition-transform duration-200 {{category.showChildren && 'rotate-90'}}" class="text-Pine  fa-solid fa-angle-right fa-bounce"></i>
            </span>

            <input
              type="checkbox"
              [checked]="isSelected(category.id)"
              (change)="onCategoryToggle(category.id)"
              class="mr-2 form-checkbox h-4 w-4 text-yellow-500"
            />

            <span  class="cursor-pointer transition-colors duration-300 group-hover/title:text-Pine text-Text text-lg">
              {{ category.label }}
            </span>
          </div>
        <button [cdkMenuTriggerFor]="menu" class="opacity-0 group-hover/bg:opacity-100 focus:flex transition-opacity duration-300 justify-center aria-expanded:bg-Pine  items-center rounded-md px-3 py-2 text-md font-medium text-Text hover:bg-Pine focus:bg-Pine focus:outline-none"><i class="fa-solid fa-ellipsis text-white"></i></button>

        </summary>
        <ng-template #menu>
        <div class=" mt-2 p-2 rounded-md shadow-lg bg-Overlay ring-1 ring-black ring-opacity-5" cdkMenu>
          <button class="block px-4 py-2 text-sm text-Text hover:text-Pine" (click)="editCategory(category)" cdkMenuItem><i class="fa-solid fa-pen ps-1"></i>  Editar</button>
          <button class="block px-4 py-2 text-sm text-Text hover:text-Pine" (click)="addSubCategory(category, category.showChildren)" cdkMenuItem><i class="fa-solid fa-pen ps-1"></i> Agregar subcategoria</button>
          <button class="block px-4 py-2 text-sm text-Text hover:text-red-400" (click)="deleteCategory(category)" cdkMenuItem><i class="fa-solid fa-xmark ps-1"></i>  Borrar</button>
        </div>
      </ng-template>
         @if(category.showChildren && category.childrens && category.childrens[0].label  !== 'no tiene hijos'){
        <ul  class="ml-6 border-l border-gray-300 pl-4">
          <app-category-tree [categories]="category.childrens"></app-category-tree>
        </ul>} @else if(category.childrens && category.childrens[0].label  === 'no tiene hijos') {
          <span  class="ps-11 text-Text cursor-not-allowed">
            sin subcategoria
          </span>
        }
      </li>
      
      }
    </ul>
    
  }
 
      <app-category-modal #categoryModal (handleGetCategories)="handleGetCategories()" ></app-category-modal>

    
    <app-delet-check [config]="deleteConfig" (handleGetCategories)="handleGetCategories()" ></app-delet-check>

  
  `,
})
export class CategoryTreeComponent implements OnInit, AfterViewInit  {
  @Input() categories: CategoryTreeDTO[] | null = [];

  selectedCategoriesSignal: Signal<number[]>;

  constructor(private treeCategoryServ: CategoryTreeService,
    private categoryServ: CategoryService
  ) {
    this.selectedCategoriesSignal = this.treeCategoryServ.selectedCategoriesSignal;
  }
 
  ngOnInit(): void {}

  isSelected(categoryId: number): boolean {
    return this.selectedCategoriesSignal().includes(categoryId);
  }

  onCategoryToggle(categoryId: number): void {
    this.treeCategoryServ.toggleCategorySelection(categoryId);
  }

  toggleChildren(category: CategoryTreeDTO): void { 
    if (category.showChildren) {
      category.showChildren = false;
      return;
    }

    if (category.childrens && category.childrens.length === 0) {
      category.showChildren = false;
      return;
    }

    if (category.childrens && category.childrens.length > 0) {
      category.showChildren = true;
      return;
    }


    this.treeCategoryServ.getCategoryChildren(category.id).subscribe(children => {
      if (children && children.length > 0) {
        category.childrens = children
          .filter(child => child.id !== category.id)
          .map(child => this.treeCategoryServ.markCategoryTree(child));
      } else {
        category.childrens = [{id: category.id, label: 'no tiene hijos'}];
        
      }
      category.showChildren = true;
    });
  } 

  // =============== Delete and edit categories ================== //

 

  @ViewChild(CategoryModalComponent ) CategoryModalComponent!: CategoryModalComponent;
  @ViewChild(DeletCheckComponent) deletCheckComponent!: DeletCheckComponent;
  DeletTypes: DeletTypes = DeletTypes.CATEGORY;
  categoryId!: number;
  selectedCategoryId!: number | null ;

  ngAfterViewInit(): void {
    if (this.CategoryModalComponent) {
      console.log('CategoryModalComponent está inicializado');
    }
  }
  deleteConfig: deleteConfig = {
    id: this.categoryId,
    itemName: '',
    toDelete: DeletTypes.CATEGORY,
    title: '¿Está seguro de que desea eliminar esta categoria?',
    text: 'Escriba el nombre de la categoria para confirmar:'
  };

  handleGetCategories(){
    setTimeout(()=>{
      this.categoryServ.fetchCategories().subscribe()
      // this.resetSelect()
    },1000)
  }

  // resetSelect() {
  //   this.selectedCategory = '';
  // }
  
  editCategory(category: Category): void {
      this.selectedCategoryId = category.id;
    
      this.CategoryModalComponent.openDialog();
      // this.CategoryModalComponent.loadFatherCategories()
      this.CategoryModalComponent.setCategory(category);
      
  
  }

  deleteCategory(category: Category) {
    const name = category.label
    if(category && name){
      this.deleteConfig.itemName = name;
      this.deleteConfig.id = category.id;
      this.deletCheckComponent.openDialog()
    }
  }

  addSubCategory(category: Category, showChildren?: boolean){
      if(category?.id){
        
      this.CategoryModalComponent.openDialog();
      this.CategoryModalComponent.loadFatherCategories()
      this.CategoryModalComponent.categoryForm.patchValue({fatherCategoryId: category.id});
    } else {
      throw new Error('no hay categoria seleccioanda ')
    }

  }

}