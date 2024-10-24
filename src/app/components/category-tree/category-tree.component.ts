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
  imports: [CommonModule, CategoryModalComponent, DeletCheckComponent, CdkMenuModule],
  templateUrl: './category-tree.component.html'
})
export class CategoryTreeComponent implements OnInit, AfterViewInit {
  @Input() categories: CategoryTreeDTO[] | null = [];
  @Input() isNavigation: boolean = false;

  selectedCategoriesSignal = this.treeCategoryServ.selectedCategoriesSignal;

  constructor(private treeCategoryServ: CategoryTreeService, private categoryServ: CategoryService) {}

  ngOnInit(): void {}

  isSelected(categoryId: number): boolean {
    return this.selectedCategoriesSignal().some(cat => cat.id === categoryId);
  }

  onCategoryToggle(category: CategoryTreeDTO): void {
    this.treeCategoryServ.toggleCategorySelection({ id: category.id, label: category.label });
  }

  handleToggleChildren(category: CategoryTreeDTO) {
    if (this.isNavigation) {
      this.toggleChildren(category);
      this.onCategoryToggle(category);
    } else {
      this.toggleChildren(category);
    }
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
        category.childrens = [{ id: category.id, label: 'no tiene hijos' }];
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
      this.categoryServ.fetchCategories().subscribe()
  }

  editCategory(category: Category): void {
      this.selectedCategoryId = category.id;
      this.CategoryModalComponent.openDialog();
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

  addSubCategory(category: Category){
      if(category?.id){
      this.CategoryModalComponent.openDialog();
      this.CategoryModalComponent.loadFatherCategories()
      this.CategoryModalComponent.categoryForm.patchValue({fatherCategoryId: category.id});
    } else {
      throw new Error('no hay categoria seleccioanda ')
    }

  }
}
