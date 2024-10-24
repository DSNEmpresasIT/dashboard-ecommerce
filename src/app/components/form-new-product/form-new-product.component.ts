import { Component, effect, OnInit, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {  Category, Product, ProductFeatures } from '../../interfaces/product';
import { ButtonSpinerComponent } from "../button-spiner/button-spiner.component";
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {  ModalService } from '../../services/modal-new-product.service';
import { CloudinaryService } from '../../services/cloudinary.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AlertService, AlertsType } from '../../services/alert.service';
import { CategoryService } from '../../services/global-api/category.service';
import { SupplierService } from '../../services/supabase/supplier.service';
import { Supplier } from '../../interfaces/supplier';
import { AuthService } from '../../services/auth.service';
import { UserAuthPayload } from '../../interfaces/auth';
import { ProductService } from '../../services/global-api/product.service';
import { firstValueFrom } from 'rxjs';
import { CategoryTreeService, SelectedCategory } from '../../services/category-tree.service';
import { CategoryTreeComponent } from "../category-tree/category-tree.component";
import { CdkMenuModule } from '@angular/cdk/menu';

@Component({
  selector: 'app-form-new-product',
  standalone: true,
  templateUrl: './form-new-product.component.html',
  styleUrls: ['./form-new-product.component.css'],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, HttpClientModule, ButtonSpinerComponent, CategoryTreeComponent, CdkMenuModule]
})
export class FormNewProductComponent implements OnInit {
  productNewForm: FormGroup;
  isLoading = false;
  product!: any
  suppliers: Supplier[] | null = [];
  payload: UserAuthPayload | null = null;
  selectedId: number | null = null;
  selectedCategoriesSignal: Signal<SelectedCategory[]>;
  

  constructor(
    private formBuilder: FormBuilder,
    private categoryServ: CategoryService,
    private supplierServ: SupplierService,
    private cloudinaryService: CloudinaryService,
    public modalToggleService: ModalService,
    private alertServ: AlertService,
    private authService: AuthService,
    private productServ: ProductService,
    private treeCategoryTestServ: CategoryTreeService,
  ) {

    this.selectedCategoriesSignal = this.treeCategoryTestServ.selectedCategoriesSignal;

    this.productNewForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      img: [''], // For previewing the selected image
      images: this.formBuilder.array([]),
      categoryIds: [[], [Validators.required]],
      catalogId: [this.payload?.user.catalogId],
      is_active_substance: [false],
      stock: [null],
      productFeatures: this.formBuilder.group({
        specs: this.formBuilder.array([]),
        items: this.formBuilder.array([])
      })
    });
    effect(() => {
      let value = this.selectedCategoriesSignal()
      this.productNewForm.patchValue({ categoryIds: value });
    })
     
  }

  getModalTitle(): string {
    if (this.selectedId) {
      const productName = this.productNewForm.get('name')?.getRawValue() || '';
      return `Editando Producto "${productName}"`;
    } else {
      return 'Ingrese los datos del producto';
    }
  }
  

  ngOnInit() {
    this.modalToggleService.modalState$.subscribe((state) => {
      if (state.isOpen && state.id) {
        this.loadProduct(state.id);
      }else {
        this.treeCategoryTestServ.getCategoryChildren().subscribe((res)=>{
          this.product = res
        })
      }
    });
  

   this.fetchAllSuppliers();

    this.authService.currentTokenPayload.subscribe(res => this.payload = res);
  }



  private async loadProduct(id: number) {
    this.selectedId = id;
    try {
      const product: Product = await firstValueFrom(this.productServ.fetchProductById(id));
      this.product = product.relatedCategoriesMarked
      this.productNewForm.patchValue({
        name: product.name,
        description: product.description,
        is_active_substance: product.is_active_substance,
        stock: product.stock,
        catalogId: product.catalog?.id || null,
      });
      if(product.categories){
        this.treeCategoryTestServ.setSelectedCategories(
          product.categories.map(cat => ({
            id: cat.id,
            label: cat.label
          }))
        );

      }
  
  
      const imagesFormArray = this.productNewForm.get('images') as FormArray;
      imagesFormArray.clear();
      product.images.forEach((image) => {
        imagesFormArray.push(this.formBuilder.group({
          id: [image.id],
          url: [image.url],
          cloudinary_id: [image.cloudinary_id]
        }));
      });
  
      this.setProductFeaturesFormArrays(product.product_features);
  
    } catch (error) {
      console.error('Error fetching product', error);
    }
  }
  
  
  private setProductFeaturesFormArrays(productFeatures: ProductFeatures | null | undefined) {
    const productFeaturesForm = this.productNewForm.get('productFeatures') as FormGroup;
  
    const specsFormArray = productFeaturesForm.get('specs') as FormArray;
    specsFormArray.clear();
    productFeatures?.specs?.forEach((spec) => {
      specsFormArray.push(this.formBuilder.control(spec));
    });

    const itemsFormArray = productFeaturesForm.get('items') as FormArray;
    itemsFormArray.clear();
    productFeatures?.items?.forEach((item) => {
      itemsFormArray.push(this.formBuilder.group({
        title: [item.title, Validators.required],
        text: [item.text, Validators.required]
      }));
    });
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
        console.log(productData, 'data antes de enviar con el nuevo arbol ')
        await this.saveProductToAPI(productData);
        this.toggleModal(false);

      } catch (error:any) {
        console.error('Error processing the form:', error);
        this.alertServ.show(10000, `Hubo un error al procesar el formulario. Corrige los errores e intenta nuevamente. ${error.message}` , AlertsType.ERROR);

      } finally {
        this.toggleLoading();
      }
    
  }

  private prepareProductData(): any {
    if (!this.productNewForm.valid){
    const errors: string[] = [];

    Object.keys(this.productNewForm.controls).forEach((key) => {
      const control = this.productNewForm.get(key);
      
      if (control && control.invalid) {
        const fieldName = key; 
        errors.push(`El campo "${fieldName}" es obligatorio.`);
      }
    });

    throw new Error(`\n${errors.join('\n')}`);
    }

      const categories = this.productNewForm.get('categoryIds')?.getRawValue();
      const categoryIds = [...categories.map((item:any) => parseInt(item.id))];
    
      const productData = {
        ...this.productNewForm.value,
        categoryIds:  categoryIds
      };
    
      delete productData.img;
      delete productData.categoryParentId;
      delete productData.subCategoryIds;
    
      return productData;
    
  }

  private async saveProductToAPI(productData: any): Promise<void> {
    try {
      const res = await firstValueFrom(this.modalToggleService.modalState$);
  
      if (res.id) {
        await this.productServ.edit(res.id, productData);
      } else {
        await this.productServ.create(productData);
      }
    } catch (error: any) {
      console.error(error.message);
    }
  }

  toggleModal(value: boolean) {
    this.treeCategoryTestServ.setSelectedCategories([])
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

}
