import { Component, effect, OnInit, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductFeature } from '../../interfaces/productSingle';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CloudinaryService } from '../../services/cloudinary.service';
import { ButtonSpinerComponent } from "../../components/button-spiner/button-spiner.component";
import { AlertService, AlertsType } from '../../services/alert.service';
import { CategoryTreeService, SelectedCategory } from '../../services/category-tree.service';
import { ProductService } from '../../services/global-api/catalog/product.service';
import { AuthService } from '../../services/auth/auth.service';
import { SupplierService } from '../../services/global-api/supplier.service';
import { Supplier } from '../../interfaces/supplier';
import { UserAuthPayload } from '../../interfaces/auth';
import { firstValueFrom } from 'rxjs';
import { Product, ProductFeatures } from '../../interfaces/product';
import { CategoryTreeComponent } from "../../components/category-tree/category-tree.component";
import { CatalogStateService } from '../../services/global-api/catalog/catalog-state.service';
import { FilesService } from '../../services/global-api/files.service';
import { FilesManagerComponent } from "../../components/files-manager/files-manager.component";
import { FileData } from '../../interfaces/data';

export enum COMPONENTSS {
  MAIN_INFORMATION = 'Information principal',
  TECHNICAL_DETAILS = 'Technical Details',
  FILES = 'Archivos',
  CATEGORIES = 'Relacion con Categorias',
  FEATURES = 'Caracteristicas'
}

@Component({
  selector: 'app-product-feature',
  standalone: true,
  templateUrl: './product-feature.component.html',
  styleUrl: './product-feature.component.css',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, ButtonSpinerComponent, CategoryTreeComponent, FilesManagerComponent]
})
export class ProductFeatureComponent implements OnInit {
  productNewForm: FormGroup;
  renderProductSingle: ProductFeature | undefined | null;
  productName: string | null | undefined;
  readonly COMPONENTS = COMPONENTSS
  componentsToRender: COMPONENTSS = this.COMPONENTS.MAIN_INFORMATION
  isLoading: boolean = false
  pdfFiles: { [key: string]: File } = {};

  product!: any
  suppliers: Supplier[] | null = [];
  payload: UserAuthPayload | null = null;
  selectedId: string | null = null;
  selectedCategoriesSignal: Signal<SelectedCategory[]>;
  catalogId: string | null = null;
  productId!: number;

  fileData!: FileData;

 

  constructor(
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private supplierServ: SupplierService,
    private cloudinaryService: CloudinaryService,
    // public modalToggleService: ModalService,
    private alertServ: AlertService,
    private authService: AuthService,
    private productServ: ProductService,
    private treeCategoryTestServ: CategoryTreeService,
    private catalogStateService: CatalogStateService,
    private fileService: FilesService
  ) {
    this.activatedRoute.queryParams.subscribe(params => {
      this.catalogId = params['catalogId'];
      if (this.catalogId) {
        this.catalogStateService.setCatalogId(this.catalogId);
      }
    });
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

  loadFileData(){
    if(!this.selectedId || !this.payload) {
      throw new Error('The product most be created before access to file managemer!!')
    }
    const data: FileData ={
      payload: this.payload,
      productoId: this.selectedId,
      imagenes: this.productNewForm.get('images') as FormArray
    }
    this.fileData = data;
  }

  switchComponentsToRender(componentToRender: COMPONENTSS): void {
    if (componentToRender !== this.COMPONENTS.FILES) {
      this.componentsToRender = componentToRender;
      return;
    }
  
    if (this.productNewForm.invalid) {
      this.alertServ.show(
        10000,
        `Debes completar los campos obligatorios *: ${this.getInvalidFields().join(', ')}`,
        AlertsType.ERROR
      );
      return;
    }
  
    if (!this.selectedId) {
      this.alertServ.showConfirmation(
        async () => {
          await this.onSubmit();
          this.loadFileData()
          this.componentsToRender = componentToRender;
        },
        "Confirmación",
        "Si entras a la sección de imágenes, el producto se creará automáticamente."
      );
      return;
    }

    this.loadFileData()
    this.componentsToRender = componentToRender;
  }
  

  getInvalidFields(): string[] {
    const invalidFields: string[] = [];
    Object.keys(this.productNewForm.controls).forEach(key => {
      const control = this.productNewForm.get(key);
      if (control && control.invalid && control.errors) {
        invalidFields.push(key);
      }
    });
    return invalidFields;
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
    this.authService.currentTokenPayload.subscribe((res) => {
      this.payload = res
    });

    this.activatedRoute.queryParams.subscribe(params => {
      this.catalogId = params['catalogId'];
      const productId = params['id'];
      if (productId) {
        this.productId = productId
      }
      if (!this.catalogId) {
        this.alertServ.show(10000, 'El catalogo no fue definido, cree uno antes de acceder a esta vista.', AlertsType.ERROR)
      }

      if (this.catalogId && productId) {
        this.loadProduct(productId);
      } else {
        this.treeCategoryTestServ.getCategoryChildren().subscribe((res) => {
          this.product = res
        })
      }

      if (this.catalogId) {
        this.catalogStateService.setCatalogId(this.catalogId);
      }
    });

    this.fetchAllSuppliers();

  }

  private async loadProduct(id: string) {
    this.selectedId = id;
    try {
      const product: Product = await firstValueFrom(this.productServ.fetchProductById(parseInt(id)));
      this.product = product.relatedCategoriesMarked
      this.productNewForm.patchValue({
        name: product.name,
        description: product.description,
        is_active_substance: product.is_active_substance,
        stock: product.stock,
        catalogId: product.catalog?.id || null,
      });
      if (product.categories) {
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
          loading: [false],
          cloudinary_id: [image.cloudinary_id]
        }));
      });
      // this.imagesToUpload() Revisar por que se llama aca imagenes to upload
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

  async removeFormItems(id: number, form: string, imageId?: any) {
    if (!imageId) {
      const itemToDelet = this.productNewForm.get(`${form}`) as FormArray
      itemToDelet.removeAt(id);
      return
    }
    try {
      const companyId = this.payload?.user.companyId
      if (companyId) {
        await this.alertServ.showConfirmation(async () => {
          const itemToDelet = this.productNewForm.get(`${form}`) as FormArray
          itemToDelet.value[id].loading = true
          this.productNewForm.get('images')?.setValue(itemToDelet.value)
          await firstValueFrom(this.fileService.deleteFileById(companyId, imageId))
          itemToDelet.removeAt(id);
          this.alertServ.show(5000, "Eliminación realizada con éxito", AlertsType.SUCCESS);
        })
      }
    } catch (error: any) {
      this.alertServ.show(10000, `Ocurrió un error al intentar eliminar. Por favor, intente nuevamente.`, AlertsType.ERROR);
    }
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
 

  async onSubmit(): Promise<void> {
    this.toggleLoading();
    try {
      const productData = this.prepareProductData();
      console.log(productData, 'data antes de enviar con el nuevo arbol ')
      await this.saveProductToAPI(productData);

    } catch (error: any) {
      console.error('Error processing the form:', error);
      this.alertServ.show(10000, `Hubo un error al procesar el formulario. Corrige los errores e intenta nuevamente. ${error.message}`, AlertsType.ERROR);

    } finally {
      this.toggleLoading();
    }
  }

  private prepareProductData(): any {
    if (!this.productNewForm.valid) {
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
    const categoryIds = [...categories.map((item: any) => parseInt(item.id))];

    const productData = {
      ...this.productNewForm.value,
      categoryIds: categoryIds
    };

    delete productData.img;
    delete productData.categoryParentId;
    delete productData.subCategoryIds;

    return productData;

  }

  private async saveProductToAPI(productData: any): Promise<void> {
    try {
      const productId = this.selectedId;
      if (productId) {
        await this.productServ.edit(parseInt(productId), productData);
      } else {
        this.productServ.create(productData).then((res)=>{
          console.log(res, 'producto creado')
          this.loadProduct(res.id)
        });
      }
    } catch (error: any) {
      console.error(error.message);
    }
  }

  // toggleModal(value: boolean) {
  //   this.treeCategoryTestServ.setSelectedCategories([])
  //   this.modalToggleService.toggleModal(value);
  // }

  toggleLoading() {
    this.isLoading = !this.isLoading;
  }

  fetchAllSuppliers() {
    this.supplierServ.getSuppliers()
    // .then((arg: Supplier[] | null)=>{
    //   this.suppliers = arg;
    // })
    // .catch(error =>{
    //   console.log('Error fetching suppliers', error);
    // });
  }



}
