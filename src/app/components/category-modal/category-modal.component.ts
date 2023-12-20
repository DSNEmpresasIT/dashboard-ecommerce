import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonSpinerComponent } from "../button-spiner/button-spiner.component";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupabaseService } from '../../services/supabase/supabase.service';
import { CategoryService } from '../../services/supabase/category.service';
import { Category } from '../../interfaces/product';

@Component({
    selector: 'app-category-modal',
    standalone: true,
    templateUrl: './category-modal.component.html',
    imports: [CommonModule, ButtonSpinerComponent, FormsModule, ReactiveFormsModule ]
})
export class CategoryModalComponent implements OnInit {
  categoryForm: FormGroup 
  isLoading : boolean = false;
  categories: Category[] | null = []

  constructor(
    private formBuilder : FormBuilder,
    private categoryServ : CategoryService
  ){ this.categoryForm  = this.formBuilder.group({
      category : [ '',Validators.required ],
      father_category : [ Number, ],
      is_substance_active : [ false ],
  }) }

  ngOnInit(): void {
    this.categoryServ.getAllFhaterCategories().then((res: Category[] | null) => {
      this.categories = res
    }).catch((error)=> {
    console.error("error to fetch fhater_categories", error)
    });
  }

  


    onSubmit(){}

    toggleModal(){}
}
