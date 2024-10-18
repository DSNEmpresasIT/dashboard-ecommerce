import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
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
export class CategoryModalComponent  {
  private _categoryIdSubject = new BehaviorSubject<number | null>(null);
  categoryId$ = this._categoryIdSubject.asObservable();// TODO:BORRAR A LA MIERDA
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
      fatherCategoryId: [null],
      is_substance_active: [false],
    });
  }

  // ngOnInit(): void {
  //   this.loadFatherCategories();
  // }
  fatherCategoryName: string | undefined;
  loadFatherCategories(category?: Category): void {
    console.log('category', category)
      
      this.fatherCategoryName = category?.label
 
      this.categoryServ.getCategories(category?.id).subscribe((res)=>{
        this.categories = res
      })
    
  }

  // loadCategory(categoryId: number): void {
  //   this.categoryServ.fetchCategories(categoryId).pipe(
  //     take(1)
  //   ).subscribe((result: Category | Category[] | null) => {
  //     let category: Category | null = null;
  //     if (Array.isArray(result)) {
  //       category = result.length > 0 ? result[0] : null;
  //     } else {
  //       category = result;
  //     }
  
  //     if (category) {
  //       console.log(category);
  //       this.categoryForm.patchValue({
  //         label: category.label,
  //         value: category.value,
  //         fatherCategoryId: category.parentId,
  //         is_substance_active: category.is_substance_active,
  //       });
  //     }
  //   }, (error) => {
  //     console.error("Error fetching category", error);
  //   });
  // }
  

  setCategory(category: Category): void {
    console.log(category, ' category id recibida ')
    this.categoryIdSelected = category.id
    this.categoryForm.patchValue({
      label: category.label,
      value: category.value,
      // fatherCategoryId: category.id,
      is_substance_active: category.is_substance_active,
    });
    
  }

  onSubmit(): void {
    console.log('aca llegue ')
    if (this.categoryForm.valid) {
      const data: CategoryDTO = {
        id: this.categoryIdSelected,
        ...this.categoryForm.value,
        fatherCategoryId: parseInt(this.categoryForm.get('fatherCategoryId')?.getRawValue())
      };
      if (this.categoryIdSelected) {
       
      
        this.updateCategory(data);
        this.handleGetCategories.emit();

      } else {
       
        this.createCategory(data);
        this.handleGetCategories.emit();

      }
    }
  }

  createCategory(data: CategoryDTO): void {
   let preparedData: CategoryDTO = {
    ...data,
    fatherCategoryId: parseInt(this.categoryForm.get('fatherCategoryId')?.getRawValue())
   }

    this.categoryServ.create(preparedData).subscribe({
      next: () => {
        this.closeDialog();
      },
      error: (error) => {
        console.error("Error creating category", error);
      }
    });
  }

  updateCategory(data: CategoryDTO): void {
    const categoryId = this.categoryIdSelected;


    if (categoryId) {
      this.categoryServ.updateCategory(data).subscribe({
        next: () => {
          this.closeDialog();
        },
        error: (error) => {
          console.error("Error updating category", error);
        }
      });
    } else {
      console.error("No category ID selected");
    }
  }

  resetForm(): void {
    this.categoryForm.reset({
      category: '',
      father_category: null, 
      is_substance_active: false 
    });
  }

  // toggleModal(): void {
  //   this.resetForm();
  //   this.categoryIdSelected = null
  //   this._categoryIdSubject.next(null);
  //   this.isOpen = !this.isOpen;
  //   if(this.isOpen){
  //     this.loadFatherCategories();
  //   }
  // }

  toggleLoading(): void {
    this.isLoading = !this.isLoading;
  }

  // ????
  @ViewChild('categoryDialog') favDialog!: ElementRef;

  openDialog() {

    this.favDialog.nativeElement.showModal();
  }

  closeDialog() {
    this.resetForm();
    this.categoryIdSelected = null
    this._categoryIdSubject.next(null);
    this.favDialog.nativeElement.close();
  }


}