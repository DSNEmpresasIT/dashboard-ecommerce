import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Product } from '../../interfaces/product';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-form-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './form-product.component.html',
  styleUrl: './form-product.component.css'
})
export class FormProductComponent implements OnInit {
  productForm: FormGroup;
  renderProduct: Product | undefined;
  @Output() booleanOutput: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private formBuilder: FormBuilder, private supaBase : SupabaseService) {
    this.productForm = this.formBuilder.group({
      id: [this.renderProduct?.id],
      name: [this.renderProduct?.name, [Validators.required]],
      formulacion: [this.renderProduct?.formulacion],
      img: [this.renderProduct?.img],
      is_active_substance: [this.renderProduct?.is_active_substance]
    });
  }

  toggleModal(){
    this.booleanOutput.emit();
  }

  ngOnInit(): void {
    this.supaBase.editProduct.subscribe((editedProduct: Product | null) => {
      if (editedProduct) {
        this.renderProduct = editedProduct;
        this.updateFormValues();
      }
    });
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
  

  onSubmit() {
    if (this.productForm.valid) {
      const formData: Product = this.productForm.value;
      console.log(formData.id)
      this.supaBase.updateProduct(formData);
    }
  }

  private updateFormValues() {
    // Actualizar los valores del formulario cuando se recibe un nuevo producto editado
    this.productForm.patchValue({
      id: this.renderProduct?.id,
      name: this.renderProduct?.name,
      formulacion: this.renderProduct?.formulacion,
      img: this.renderProduct?.img,
      is_active_substance: this.renderProduct?.is_active_substance
    });
  }

}
