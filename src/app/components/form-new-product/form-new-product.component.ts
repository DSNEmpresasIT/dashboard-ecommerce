import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase/supabase.service';
import { Category } from '../../interfaces/product';
import { ButtonSpinerComponent } from "../button-spiner/button-spiner.component";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { ModalNewProductService } from '../../services/modal-new-product.service';

@Component({
    selector: 'app-form-new-product',
    standalone: true,
    templateUrl: './form-new-product.component.html',
    styleUrl: './form-new-product.component.css',
    imports: [CommonModule, ReactiveFormsModule, FormsModule, ButtonSpinerComponent]
})
export class FormNewProductComponent implements OnInit {
  productForm: FormGroup ;
  isLoading: boolean= false;
  categories:Category[] | null = []; 
  @Output() newProductForm: EventEmitter<boolean> = new EventEmitter<boolean>();
  
  constructor(private formBuilder: FormBuilder, private supabase: SupabaseService, private modalToggleService: ModalNewProductService) {
    this.productForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      formulacion: [''],
      img: [''],
      is_active_substance: [''],
      selectedCategory: ['', [Validators.required]] // Agregado el campo selectedCategory
    });
  }
  
  ngOnInit(): void {
    this.supabase.fetchAllCategories()
      .then((arg: Category[] | null)=>{
        this.categories = arg;
      })
      .catch(error =>{
        console.log('Error fetching categories:', error);
      })
      
  }

  async onImageSelected(event: Event): Promise<void> {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files.length > 0) {
      const file = inputElement.files[0];
      const reader = new FileReader();
  
      // Esperar a que se complete la lectura del archivo
      await new Promise<void>((resolve, reject) => {
        reader.onload = (e: any) => {
          this.productForm.get('img')?.setValue(e.target.result);
          resolve();
        };
  
        reader.onerror = (error) => {
          reject(error);
        };
  
        reader.readAsDataURL(file);
      });
    }
  }

  toggleModal(value: boolean) {
    this.modalToggleService.toggleModal(value)
  }

  toggleLoading(){
    this.isLoading = !this.isLoading
  }

  async onSubmit(): Promise<void> {
    if (this.productForm.valid) {
      this.toggleLoading();
      const productData = { ...this.productForm.value }; // Copiar todas las propiedades
  
      // Eliminar selectedCategory del objeto si existe
      if ('selectedCategory' in productData) {
        delete productData.selectedCategory;
      }
  
      try {
        const newProduct = await this.supabase.newProduct(productData, this.productForm.value.selectedCategory);
  
        if (newProduct) {
          console.log('Producto agregado con éxito:', newProduct);
          this.toggleModal(false);
          
        } else {
          console.error('Error al agregar el producto.');
          // Manejar el caso de error al agregar el producto
        }
      } catch (error) {
        console.error('Error al agregar el producto:', error);
        // Manejar el caso de error al agregar el producto
      } finally {
        this.toggleLoading();
        this.toggleModal(false);
      }
    } else {
      console.error('El formulario no es válido.');
      // Manejar el caso de un formulario no válido si es necesario
    }
  }
  

}
