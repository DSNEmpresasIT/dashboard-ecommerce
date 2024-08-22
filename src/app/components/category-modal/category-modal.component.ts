import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonSpinerComponent } from "../button-spiner/button-spiner.component";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../../services/global-api/category.service';
import { Category } from '../../interfaces/product';
import { BehaviorSubject, take } from 'rxjs';
import { CategoryDTO } from '../../interfaces/catalogsDTO';

@Component({
    selector: 'app-category-modal',
    standalone: true,
    templateUrl: './category-modal.component.html',
    imports: [CommonModule, FormsModule, ReactiveFormsModule, ButtonSpinerComponent]
})
export class CategoryModalComponent implements OnInit {
  private _categoryIdSubject = new BehaviorSubject<number | null>(null);
  categoryId$ = this._categoryIdSubject.asObservable();
  categoryIdSelected = this._categoryIdSubject.value
  isOpen: boolean = false;
  categoryForm: FormGroup;
  isLoading: boolean = false;
  categories: Category[] | null = [];
  @Output() handleGetCategories = new EventEmitter<any>();

  constructor(
    private formBuilder: FormBuilder,
    public categoryServ: CategoryService
  ) {
    this.categoryForm = this.formBuilder.group({
      label: ['', Validators.required],
      value: ['', Validators.required],
      father_category: [null],
      is_substance_active: [false],
    });
  }

  ngOnInit(): void {
    this.loadFatherCategories();
  }

  loadFatherCategories(): void {
    this.categoryServ.fetchCategories()
  }

  loadCategory(categoryId: number): void {
    // this.categoryServ.getCategoryById(categoryId).pipe(
    //   take(1) 
    // ).subscribe((category: Category | null) => {
    //   if (category) {
    //     console.log(category)
    //     this.categoryForm.patchValue({
    //       category: category.label,
    //       father_category: category.father_category,
    //       is_substance_active: category.is_substance_active,
    //     });
    //   }
    // }, (error) => {
    //   console.error("Error fetching category", error);
    // });
  }

  setCategoryId(categoryId: number | null): void {
    this._categoryIdSubject.next(categoryId);
    if(categoryId) {
      this.loadCategory(categoryId)
      this.categoryIdSelected = categoryId
      this.categoryId$.subscribe(categoryId => {
        if (categoryId !== null) {
          this.loadCategory(categoryId);
        }
      });
    }
    
  }

  onSubmit(): void {
    console.log('aca llegue ')
    if (this.categoryForm.valid) {
      const data = this.categoryForm.value;
      if (this.categoryIdSelected) {
        console.log('actualizar')
        // this.updateCategory(data);
        // this.handleGetCategories.emit();

      } else {
        console.log(
          'crear'
          , this._categoryIdSubject.value,
           this.categoryIdSelected)
        this.createCategory(data);
        this.handleGetCategories.emit();

      }
    }
  }

  createCategory(data: CategoryDTO): void {
    this.categoryServ.create(data).subscribe({
      next: () => {
        this.toggleModal();
      },
      error: (error) => {
        console.error("Error creating category", error);
      }
    });
  }

  updateCategory(data: Category): void {
    // const categoryId = this.categoryIdSelected;
    // if (categoryId) {
    //   this.categoryServ.editCategory(categoryId, data).then(() => {
    //     this.toggleModal();
    //   }).catch((error) => {
    //     console.error("Error updating category", error);
    //   });
    // }
  }

  resetForm(): void {
    this.categoryForm.reset({
      category: '',
      father_category: null, 
      is_substance_active: false 
    });
  }

  toggleModal(): void {
    this.resetForm();
    this._categoryIdSubject.next(null);
    this.isOpen = !this.isOpen;
    if(this.isOpen){
      this.loadFatherCategories();
    }
  }

  toggleLoading(): void {
    this.isLoading = !this.isLoading;
  }
}