import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase/supabase.service';
import { Category } from '../../interfaces/product';
import { ButtonSpinerComponent } from "../button-spiner/button-spiner.component";
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
  categories: Category[] | null = []; 
  subCategories : Category[] | null = []; 
  suppliers: Supplier[] | null = []; 
  @Output() newproductNewForm: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    private formBuilder: FormBuilder,
    private categoryServ : CategoryService,
    private supplierServ: SupplierService,
    private cloudinaryService : CloudinaryService,
    private modalToggleService : ModalNewProductService,
    private alertServ: AlertService) {

    this.productNewForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      description: [''],
      formulacion: [''],
      img: [''], // For previewing the selected image
      images: this.formBuilder.array([]),
      categoryId: ['', [Validators.required]],
      catalogId: ['', [Validators.required]],
      is_active_substance: [false],
      stock: [null],
      code: [''],
      unid: [''],
      env: [null],
      supplierId: [null, [Validators.required]],
      productFeatures: this.formBuilder.group({
        items: this.formBuilder.array([]),
        specs: this.formBuilder.array([])
      })
    });
  }

  addImage() {
    const images = this.productNewForm.get('images') as FormArray;
    images.push(this.formBuilder.group({
      cloudinary_id: ['', Validators.required],
      url: ['', Validators.required]
    }));
  }
  get imagesArray(): FormArray {
    return this.productNewForm.get('images') as FormArray;
  }
  addFeatureItem() {
    const items = this.productNewForm.get('productFeatures.items') as FormArray;
    items.push(this.formBuilder.group({
      title: ['', Validators.required],
      text: ['', Validators.required]
    }));
  }
  get featuresArray(): FormArray {
    return this.productNewForm.get('productFeatures.items') as FormArray;
  }
  addSpec() {
    const specs = this.productNewForm.get('productFeatures.specs') as FormArray;
    specs.push(this.formBuilder.control(''));
  }

  async onImageSelected(event: Event): Promise<void> {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files.length > 0) {
      const files = Array.from(inputElement.files);
      const maxSizeInBytes = 500 * 1024; // 500kb

      for (const file of files) {
        if (file.size > maxSizeInBytes) {
          this.alertServ.show(6000, "Una de las imágenes supera el tamaño máximo de 500kb", AlertsType.ERROR);
          continue; // Skip this file
        }

        const reader = new FileReader();

        await new Promise<void>((resolve, reject) => {
          reader.onload = async (e: any) => {
            const imageData = e.target.result;
            const cloudinaryResponse = await this.uploadToCloudinary(imageData);

            if (cloudinaryResponse) {
              this.addImageWithUrl(cloudinaryResponse.cloudinary_id, cloudinaryResponse.url);
            }

            resolve();
          };

          reader.onerror = (error) => {
            reject(error);
          };

          reader.readAsDataURL(file);
        });
      }
    }
  }

  addImageWithUrl(cloudinaryId: string, url: string) {
    const images = this.productNewForm.get('images') as FormArray;
    images.push(this.formBuilder.group({
      cloudinary_id: [cloudinaryId, Validators.required],
      url: [url, Validators.required]
    }));
  }

  async uploadToCloudinary(imageData: File): Promise<any> {
    return new Promise((resolve, reject) => {
      this.cloudinaryService.uploadImage(imageData).subscribe(
        (response) => {
          resolve(response);
        },
        (error) => {
          console.error('Error uploading image to Cloudinary:', error);
          reject(error);
        }
      );
    });
  }

  async onSubmit(): Promise<void> {
    if (this.productNewForm.valid) {
      this.toggleLoading();

      try {
        const productData = this.prepareProductData();

        // Save product to API
        await this.saveProductToAPI(productData);
      } catch (error) {
        console.error('Error processing the form:', error);
      } finally {
        this.toggleLoading();
        this.toggleModal(false);
      }
    }
  }

  private prepareProductData(): any {
    const productData = { ...this.productNewForm.value };
    
    delete productData.img; // Remove the img field used for previewing

    return productData;
  }

  private async saveProductToAPI(productData: any): Promise<void> {
    try {
      // const newProduct = await this.productServ.saveProduct(productData);
      // if (newProduct) {
      //   this.alertServ.show(6000, "Producto agregado con éxito", AlertsType.SUCCESS);
      //   // this.cloudinaryService.updateProducts();
      // }
    } catch (error) {
      this.alertServ.show(6000, "Error al agregar el producto", AlertsType.ERROR);
    }
  }

  toggleModal(value: boolean) {
    this.modalToggleService.toggleModal(value);
  }

  toggleLoading(){
    this.isLoading = !this.isLoading;
  }

  ngOnInit(): void {
    this.categoryServ.getAllFhaterCategories()
      .then((arg: Category[] | null)=>{
        this.categories = arg;
      })
      .catch(error =>{
        console.log('Error fetching categories:', error);
      });

    this.fetchAllSuppliers();
  }

  fetchAllSuppliers(){
    this.supplierServ.getSuppliers()
      .then((arg: Supplier[] | null)=>{
        this.suppliers = arg;
      })
      .catch(error =>{
        console.log('Error fetching suppliers', error);
      });
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

}
