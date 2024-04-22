import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase/supabase.service';
import { Category } from '../../interfaces/product';
import { ButtonSpinerComponent } from "../button-spiner/button-spiner.component";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalNewProductService } from '../../services/modal-new-product.service';
import { CloudinaryService } from '../../services/cloudinary.service';
import { HttpClientModule } from '@angular/common/http';
import { AlertService, AlertsType } from '../../services/alert.service';
import { CategoryService } from '../../services/supabase/category.service';
import { SupplierService } from '../../services/supabase/supplier.service';
import { Supplier } from '../../interfaces/supplier';

@Component({
    selector: 'app-form-new-product',
    standalone: true,
    templateUrl: './form-new-product.component.html',
    styleUrl: './form-new-product.component.css',
    imports: [CommonModule, ReactiveFormsModule, FormsModule, ButtonSpinerComponent, HttpClientModule]
  })
  export class FormNewProductComponent implements OnInit {
    productNewForm: FormGroup ;
    isLoading: boolean= false;
    categories:Category[] | null = []; 
    subCategories :Category[] | null = []; 
    suppliers: Supplier[] | null = []; 
  @Output() newproductNewForm: EventEmitter<boolean> = new EventEmitter<boolean>();
  
  constructor(private formBuilder: FormBuilder,
     private supabase: SupabaseService,
     private categoryServ : CategoryService,
     private supplierServ: SupplierService,
      private cloudinaryService : CloudinaryService,
      private modalToggleService : ModalNewProductService,
     private alertServ: AlertService) {
    this.productNewForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      stock:[ null ],
      code:[ null ],
      formulacion: [''],
      img: [''],
      unid: [''],
      selectedCategory: ['', [Validators.required]],
      selectedSubCategories: [ '' , [Validators.required]],
      supplier_id: [ null ,[Validators.required]]
    });
  }
  
  ngOnInit(): void {
    this.categoryServ.getAllFhaterCategories()
      .then((arg: Category[] | null)=>{
        this.categories = arg;
      })
      .catch(error =>{
        console.log('Error fetching categories:', error);
      });

      this.fetchAllSuppliers()
      
  }

  getChillCategories(event : Event) {
    const target = event.target as HTMLSelectElement;
    const categoryId = parseInt(target.value);


    this.categoryServ.getChildrenCategories(categoryId)
    .then((arg: Category[] | null)=>{
      this.subCategories = arg;
      console.log(this.subCategories)
    })
    .catch(error =>{
      console.log('Error fetching categories:', error);
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

  async onImageSelected(event: Event): Promise<void> {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files.length > 0) {
      const file = inputElement.files[0];
      const maxSizeInBytes = 500 * 1024; // 500kb

      if (file.size > maxSizeInBytes) {
        console.error('The file exceeds the maximum allowed size.');
        this.alertServ.show(6000, "La imagen supera el tamaño maximo de 500kb", AlertsType.ERROR)
        return;
      }

      const reader = new FileReader();

      await new Promise<void>((resolve, reject) => {
        reader.onload = (e: any) => {
          this.productNewForm.get('img')?.setValue(e.target.result);
          resolve();
        };

        reader.onerror = (error) => {
          reject(error);
        };

        reader.readAsDataURL(file);
      })

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

  toggleModal(value: boolean) {
    this.modalToggleService.toggleModal(value)
  }

  toggleLoading(){
    this.isLoading = !this.isLoading
  }

  async onSubmit(): Promise<void> {
    if (this.productNewForm.valid) {
      this.toggleLoading();
  
      try {
        let cloudinaryUrl: string | undefined;

        // Check if an image is selected
        const imgBase64 = this.productNewForm.get('img')?.value;
        if(imgBase64){
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
        this.toggleModal(false);
      }
    }
  }
  
  private async uploadImageToCloudinary(): Promise<string | undefined> {
    try {
      const imgBase64 = this.productNewForm.get('img')?.value;
      if (imgBase64) {
        const cloudinaryResponse = await this.uploadToCloudinary(imgBase64);
        return cloudinaryResponse?.url;
      } else {
        console.error('The image is not available.');
        return undefined;
      }
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error);
      return undefined;
    }
  }
  
  private prepareProductData(cloudinaryUrl: string): any {
    const productData = { ...this.productNewForm.value };
    productData.img = cloudinaryUrl;
  
    if ('selectedCategory' in productData) {
      delete productData.selectedCategory;
    } 
    
    if ('selectedSubCategories' in productData) {
      delete productData.selectedSubCategories;
    }

    return productData;
  }
  
  private async saveProductToSupabase(productData: any): Promise<void> {
    try {
      const newProduct = await this.supabase.newProduct(productData, this.productNewForm.value.selectedCategory, this.productNewForm.value.selectedSubCategories);
      if (newProduct) {
        this.alertServ.show(6000, "producto agregado con exito", AlertsType.SUCCESS)
        this.supabase.updateProducts();
      }
    } catch (error) {
      this.alertServ.show(6000, "Error al agregar el producto", AlertsType.ERROR)

    }
  }
  

}
