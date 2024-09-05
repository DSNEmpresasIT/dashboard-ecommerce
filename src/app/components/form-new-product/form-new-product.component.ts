import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase/supabase.service';
import { Category, Product } from '../../interfaces/product';
import { ButtonSpinerComponent } from "../button-spiner/button-spiner.component";
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalService } from '../../services/modal-new-product.service';
import { CloudinaryService } from '../../services/cloudinary.service';
import { HttpClientModule } from '@angular/common/http';
import { AlertService, AlertsType } from '../../services/alert.service';
import { CategoryService } from '../../services/global-api/category.service';
import { SupplierService } from '../../services/supabase/supplier.service';
import { Supplier } from '../../interfaces/supplier';
import { AuthService } from '../../services/auth.service';
import { UserAuthPayload } from '../../interfaces/auth';
import { ProductService } from '../../services/global-api/product.service';
import { firstValueFrom, take } from 'rxjs';

@Component({
  selector: 'app-form-new-product',
  standalone: true,
  templateUrl: './form-new-product.component.html',
  styleUrls: ['./form-new-product.component.css'], // Corrected from styleUrl to styleUrls
  imports: [CommonModule, ReactiveFormsModule, FormsModule, HttpClientModule, ButtonSpinerComponent]
})
export class FormNewProductComponent implements OnInit {
  productNewForm: FormGroup;
  isLoading = false;
  categories: Category[] | null = [];
  subCategories: Category[] | null = [];
  suppliers: Supplier[] | null = [];
  payload: UserAuthPayload | null = null;
  selectedId: number | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private categoryServ: CategoryService,
    private supplierServ: SupplierService,
    private cloudinaryService: CloudinaryService,
    public modalToggleService: ModalService,
    private alertServ: AlertService,
    private authService: AuthService,
    private productServ: ProductService
  ) {
    this.productNewForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      img: [''], // For previewing the selected image
      images: this.formBuilder.array([]),
      categoryId: [0, [Validators.required]],
      catalogId: [this.payload?.user.catalogId],
      is_active_substance: [false],
      stock: [null],
      productFeatures: this.formBuilder.group({
        specs: this.formBuilder.array([]),
        items: this.formBuilder.array([])
      })
    });
  }

  ngOnInit() {
    this.modalToggleService.modalState$.subscribe((state) => {
      console.log(state.id, 'id de servicio')
      if (state.isOpen && state.id) {
        this.loadProduct(state.id);
      }
    });

    this.categoryServ.category
    .subscribe((arg: Category[] | null)=>{
      this.categories = arg;
    })
   this.fetchAllSuppliers();

    this.authService.currentTokenPayload.subscribe(res => this.payload = res);
  }

  private async loadProduct(id: number) {
    this.selectedId = id;
    try {
      const product: Product = await firstValueFrom(this.productServ.fetchProductById(id));
      this.productNewForm.patchValue({
        name: product.name,
        description: product.description,
        // Add other fields here
      });
    } catch (error) {
      console.error('Error fetching product', error);
    }
  }
  

  
  addFeatureItem() {
    const items = this.productNewForm.get('productFeatures.items') as FormArray;
    if (items) {
      items.push(this.formBuilder.group({
        title: ['', Validators.required],
        text: ['', Validators.required]
      }));
    }
  }

  removeFormItems(id: number, form: string){
    const itemToDelet = this.productNewForm.get(`${form}`) as FormArray
    itemToDelet.removeAt(id);
  }
  
  addSpec() {
    const specs = this.productNewForm.get('productFeatures.specs') as FormArray;
    if (specs) {
      specs.push(this.formBuilder.control(''));
    }
  }
  
  get featuresArray(): FormArray {
    return this.productNewForm.get('productFeatures.items') as FormArray;
  }
  
  get featureSpects(): FormArray {
    return this.productNewForm.get('productFeatures.specs') as FormArray;
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
            console.log(cloudinaryResponse, 'cloudinary')

            if (cloudinaryResponse) {
              this.addImageWithUrl(cloudinaryResponse.asset_id, cloudinaryResponse.url);
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

  private prepareProductData(): any {
    if (!this.productNewForm.valid){
      throw new Error('form is not valid :c') 
    }
    const category = parseInt(this.productNewForm.get('categoryId')?.getRawValue())
    const productData = { ...this.productNewForm.value,categoryId: category };
    
    delete productData.img; // Remove the img field used for previewing

    return productData;
  }

  private async saveProductToAPI(productData: any): Promise<void> {
    try {
      const newProduct = await this.productServ.create(productData);
      if (newProduct) {
        this.alertServ.show(6000, "Producto agregado con éxito", AlertsType.SUCCESS);
        // this.cloudinaryService.updateProducts();
      }
      console.log(productData, ' creando producto')
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

    this.categoryServ.fetchCategories(categoryId)
    .subscribe((arg: Category[] | null)=>{
      this.subCategories = arg;
      console.log(this.subCategories)
    })

  }

}
