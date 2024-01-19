import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Category, Product } from '../../interfaces/product';
import { SupabaseService } from '../../services/supabase/supabase.service';
import { ButtonSpinerComponent } from "../button-spiner/button-spiner.component";
import { AlertService, AlertsType } from '../../services/alert.service';
import { CloudinaryService } from '../../services/cloudinary.service';
import { Supplier } from '../../interfaces/supplier';
import { SupplierService } from '../../services/supabase/supplier.service';
import { CategoryService } from '../../services/supabase/category.service';

@Component({
    selector: 'app-form-product',
    standalone: true,
    templateUrl: './form-product.component.html',
    styleUrl: './form-product.component.css',
    imports: [CommonModule, ReactiveFormsModule, FormsModule, ButtonSpinerComponent]
})
export class FormProductComponent implements OnInit {
  productForm: FormGroup;
  isLoading: boolean= false;
  renderProduct: Product | undefined;
  categories:Category[] | null = []; 
  suppliers: Supplier[] | null = []; 
  selectedCategory: Category | null = null;
  @Output() booleanOutput: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private formBuilder: FormBuilder, private supabase : SupabaseService,
    private alertServ: AlertService,
    private supplierServ: SupplierService,
    private categoryServ: CategoryService,
    private cloudinaryService: CloudinaryService
  ) {
    this.productForm = this.formBuilder.group({
      id: [this.renderProduct?.id],
      name: [this.renderProduct?.name, [Validators.required]],
      stock:[ null ],
      code:[ null ],
      formulacion: [this.renderProduct?.formulacion],
      img: [this.renderProduct?.img],
      is_active_substance: [this.renderProduct?.is_active_substance !== undefined ? this.renderProduct.is_active_substance : false],
      supplier_id: [ null , [Validators.required]],
      category_id: [ null , [Validators.required]]
    });
  }

  getCategoryOfOneProduct(id: number){
    this.categoryServ.fetchCategoryOfOneProduct(id)
    .then((arg: Category | null | undefined)=>{
      if(arg){
        console.log(arg, 'categoria del producto en el form')
        this.selectedCategory = arg

        this.productForm.patchValue({ 'category_id': this.selectedCategory?.id });
        this.productForm.patchValue({ 'supplier_id': this.renderProduct?.supplier_id });
        return arg
      }
      return null
    })
    .catch(error =>{
     throw new Error('error fetching category', error.message)
    })
  }

  toggleModal(){
    this.booleanOutput.emit();
  }

  toggleLoading(){
    this.isLoading = !this.isLoading
  }

  ngOnInit(): void {
    this.supabase.editProduct.subscribe((editedProduct: Product | null) => {
      if (editedProduct) {
        this.fetchAllSuppliers()
        this.getAllCategory()
        this.renderProduct = editedProduct;
        this.updateFormValues();
        this.getCategoryOfOneProduct(this.renderProduct.id)
        
       
      }
    });
    
  }
  
  fetchAllSuppliers(){
    this.supplierServ.getSuppliers()
    .then((arg: Supplier[] | null)=>{
      this.suppliers = arg
    })
    .catch(error =>{
      console.log('error fetching suppliers', error)
    })
  }

  async getAllCategory(){
    try {
      this.categories = await this.categoryServ.getAllChildrenCategories();
    } catch (error) {
      console.log('Error al cargar categorías', error);
    }
  }
  
  async onImageSelected(event: Event): Promise<void> {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files.length > 0) {
      const file = inputElement.files[0];
      const reader = new FileReader();
  
      const maxSizeInBytes = 500 * 1024; // 500kb
  
      if (file.size > maxSizeInBytes) {
        console.error('The file exceeds the maximum allowed size.');
        this.alertServ.show(6000, "La imagen supera el tamaño maximo de 500kb", AlertsType.ERROR);
        return;
      }
  
      await new Promise<void>((resolve, reject) => {
        reader.onload = async (e: any) => {
          if (this.renderProduct?.img) {
            // Elimina la imagen antigua de Cloudinary antes de asignar la nueva
            await this.cloudinaryService.onEditImageSelected(this.renderProduct.img);
          }
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
  
  

  async onSubmit(): Promise<void> {
    if (this.productForm.valid) {
      this.toggleLoading();
  
      try {
        let cloudinaryUrl: string | undefined;
  
        // Check if an image is selected
        const imgBase64 = this.productForm.get('img')?.value;
        if (imgBase64) {
          cloudinaryUrl = await this.uploadImageToCloudinary();
        }
  
        // Prepare product data with or without the Cloudinary URL
        const productData = this.prepareProductData(cloudinaryUrl as string);
  
        // Save product to Supabase
        await this.saveProductToSupabase(productData);
  
      } catch (error) {
        console.error('Error processing the form:', error);
      } finally {
        this.toggleLoading();
        this.toggleModal();
      }
    }
  }
  

  uploadToCloudinary(file: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.cloudinaryService.uploadImage(file).subscribe(
        (response) => {
          console.log('Image uploaded to Cloudinary:', response);
          resolve(response);
        },
        (error) => {
          console.error('Error uploading image to Cloudinary:', error);
          reject(error);
        }
      );
    });
  }
  
  private async uploadImageToCloudinary(): Promise<string | undefined> {
    try {
      const imgBase64 = this.productForm.get('img')?.value;
      if (imgBase64) {
        if (this.renderProduct?.img) {
          // Elimina la imagen antigua de Cloudinary antes de cargar la nueva
          await this.cloudinaryService.onEditImageSelected(this.renderProduct.img);
        }
        const cloudinaryResponse = await this.uploadToCloudinary(imgBase64);
        return cloudinaryResponse?.url;
      } else {
        // Image is not available, return undefined
        return undefined;
      }
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error);
      return undefined;
    }
  }
  
  private prepareProductData(cloudinaryUrl: string): any {
    const productData = { ...this.productForm.value };
    productData.img = cloudinaryUrl;
  
    if ('category_id' in productData) {
      delete productData.category_id;
    }
  
    return productData;
  }
  
  private async saveProductToSupabase(productData: any): Promise<void> {
    try {
      const newProduct = await this.supabase.updateProduct(productData);
      if (newProduct) {
        this.alertServ.show(6000, "producto actualizado con exito", AlertsType.SUCCESS)
        this.supabase.updateProducts();
        this.editProductCategory()
      }
    } catch (error) {
      this.alertServ.show(6000, "Error al agregar el producto", AlertsType.ERROR)
    }
  }

  private async editProductCategory(){
    const product_id = this.renderProduct?.id;
    const category_id = this.productForm.get('category_id')?.value;
    console.log(product_id, category_id, 'id de producto y categoria');

    this.categoryServ.editProductCategory(product_id, category_id)
  }

  private updateFormValues() {
    // Actualizar los valores del formulario cuando se recibe un nuevo producto editado
    this.productForm.patchValue({
      id: this.renderProduct?.id,
      name: this.renderProduct?.name,
      formulacion: this.renderProduct?.formulacion,
      img: this.renderProduct?.img,
      is_active_substance: this.renderProduct?.is_active_substance,
      stock: this.renderProduct?.stock,
      code: this.renderProduct?.code,
    });
  }

}
