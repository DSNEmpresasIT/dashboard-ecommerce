import { Component, Input, OnInit, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryTreeService } from '../../services/category-tree.service';
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
  imports: [CommonModule],
  template: `
  @if(categories){
    <ul class="ml-4">
      @for (category of categories; track $index) {
      <li class="mb-2">
        <div class="flex items-center">

          <span (click)="toggleChildren(category)" class="cursor-pointer mr-2">
            <i class="transition-transform duration-200 {{category.showChildren && 'rotate-90'}}" class="text-Pine  fa-solid fa-angle-right fa-bounce"></i>
          </span>

          <input
            type="checkbox"
            [checked]="isSelected(category.id)"
            (change)="onCategoryToggle(category.id)"
            class="mr-2 form-checkbox h-4 w-4 text-yellow-500"
          />

          <span (click)="toggleChildren(category)" class="cursor-pointer hover:text-Pine text-Text text-lg">
            {{ category.label }}
          </span>
        </div>

         @if(category.showChildren && category.childrens && category.childrens[0].label  !== 'no tiene hijos'){
        <ul  class="ml-6 border-l border-gray-300 pl-4">
          <app-category-tree [categories]="category.childrens"></app-category-tree>
        </ul>} @else if(category.childrens && category.childrens[0].label  === 'no tiene hijos') {
          <span  class="ps-11 text-Text cursor-not-allowed">
            No tiene hijos
          </span>
        }
      </li>
      }
    </ul>
  }
  `,
})
export class CategoryTreeComponent implements OnInit {
  @Input() categories: CategoryTreeDTO[] | undefined = [];

  selectedCategoriesSignal: Signal<number[]>;

  constructor(private categoryService: CategoryTreeService) {
    this.selectedCategoriesSignal = this.categoryService.selectedCategoriesSignal;
  }

  ngOnInit(): void {}

  isSelected(categoryId: number): boolean {
    return this.selectedCategoriesSignal().includes(categoryId);
  }

  onCategoryToggle(categoryId: number): void {
    this.categoryService.toggleCategorySelection(categoryId);
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


    this.categoryService.getCategoryChildren(category.id).subscribe(children => {
      if (children && children.length > 0) {
        category.childrens = children
          .filter(child => child.id !== category.id)
          .map(child => this.categoryService.markCategoryTree(child));
      } else {
        category.childrens = [{id: category.id, label: 'no tiene hijos'}];
        
      }
      category.showChildren = true;
    });
  } 

  
  
  
  
}