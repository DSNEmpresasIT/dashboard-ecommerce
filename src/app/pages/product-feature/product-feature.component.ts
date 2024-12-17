import { Component, effect, ElementRef, Input, OnInit, Signal, ViewChild } from '@angular/core';
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
import { ProductPreviewComponent } from "../../components/product-preview/product-preview.component";
import { FilesService } from '../../services/global-api/files.service';
import { ApiResponse } from '../../interfaces/response';
import { NzFormatEmitEvent, NzTreeModule, NzTreeNodeOptions } from 'ng-zorro-antd/tree';

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
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, ButtonSpinerComponent, CategoryTreeComponent, ProductPreviewComponent, NzTreeModule]
})
export class ProductFeatureComponent implements OnInit {
  productNewForm: FormGroup;
  fileName: string = '';
  renderProductSingle: ProductFeature | undefined | null;
  productName: string | null | undefined;
  readonly COMPONENTS = COMPONENTSS
  componentsToRender: COMPONENTSS = this.COMPONENTS.MAIN_INFORMATION
  isLoading: boolean = false
  pdfFiles: { [key: string]: File } = {};
  imageToUpload = false
  switchComponentsToRender(componentToRender: COMPONENTSS) {
    this.componentsToRender = componentToRender
  }
  uploading = false
  product!: any
  suppliers: Supplier[] | null = [];
  payload: UserAuthPayload | null = null;
  selectedId: string | null = null;
  selectedCategoriesSignal: Signal<SelectedCategory[]>;
  catalogId: string | null = null;
  productId!: number
  public nodes!: NzTreeNodeOptions[]
  nzEvent(event: NzFormatEmitEvent): void {
    if(event.eventName === 'expand' && event.node?.isExpanded || event.keys?.length !== 0) {
      if(!event.node?.key) return
      this.treeCategoryTestServ.getCategoryChildren(parseInt(event.node?.key)).subscribe((res) => {
        this.nodes.forEach((category) => {
          if(category.key == event.node?.key) {
            const children = res.map((product: any) => {
              return {
                title: product.label,
                key: product.id
              }
            })
            category.children = children
          }
        })
        this.nodes = [...this.nodes]
      })
    }
  }
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
      this.nodes = this.product.map((product: any) => {
        return {
          title: product.label,
          key: product.id,
          children: []
        }
      })
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
      this.imagesToUpload()
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
        await this.alertServ.showDeleteConfirmation(async () => {
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
    if (!inputElement.files || inputElement.files.length === 0) {
      this.fileName = 'Ningún archivo seleccionado'
    } else {
      const images: { file: File; preview: string; }[] = []
      for (let i = 0; i < inputElement.files.length; i++) {
        const file = inputElement.files[i];
        const reader = new FileReader();
        reader.onload = () => {
          const img = {
            file,
            preview: reader.result as string
          }
          images.push(img);
          this.addImageWithUrl(file.name, img.preview)
        };
        reader.readAsDataURL(file);
      }
    }
    this.imageToUpload = true
  }
  imagesToUpload() {
    const images = this.productNewForm.get('images')?.value.find((img: any) => !img.id)
    this.imageToUpload = images && images.length !== 0
  }
  dataURIToBlob(dataURI: string) {
    const splitDataURI = dataURI.split(',')
    const byteString = splitDataURI[0].indexOf('base64') >= 0 ? atob(splitDataURI[1]) : decodeURI(splitDataURI[1])
    const mimeString = splitDataURI[0].split(':')[1].split(';')[0]
    const ia = new Uint8Array(byteString.length)
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i)
    }
    return new Blob([ia], { type: mimeString })
  }
  addImageWithUrl(cloudinaryId: string, url: string) {
    const images = this.productNewForm.get('images') as FormArray;
    images.push(this.formBuilder.group({
      id: [''],
      cloudinary_id: [cloudinaryId, Validators.required],
      url: [url, Validators.required],
      loading: [false]
    }));
  }
  async uploadImage(image: any): Promise<void> {
    this.uploading = true
    const loadingControl = image.get('loading');
    const cloudinaryId = image.get('cloudinary_id').value;
    const imageUrl = image.get('url').value;
    loadingControl.setValue(true);
    const companyId = this.payload?.user.companyId;
    if (!companyId) return
    try {
      const imageBlob = this.dataURIToBlob(imageUrl);
      const formData = new FormData();
      formData.append('file', imageBlob, cloudinaryId);
      formData.append('companyId', companyId.toString());
      formData.append('productId', this.productId.toString());
      const response = await firstValueFrom(this.fileService.uploadFile(formData)) as ApiResponse
      image.get('id').setValue(response.content[0]);
      this.alertServ.show(3000, 'Imagen subida exitosamente', AlertsType.SUCCESS);
    } catch (error) {
      this.alertServ.show(3000, `Error al subir la imagen: ${cloudinaryId}`, AlertsType.ERROR);
    } finally {
      this.uploading = false
      loadingControl.setValue(false);
    }
    this.imagesToUpload()
  }
  async uploadImages() {
    try {
      const formData = new FormData();
      this.uploading = true
      let images = this.productNewForm.get('images')?.value
      images.forEach((img: any) => {
        if (!img.id) {
          const imageBlob = this.dataURIToBlob(img.url);
          formData.append(`file`, imageBlob, img.cloudinary_id);
          img.loading = true
        }
      });
      this.productNewForm.get('images')?.setValue(images)
      const companyId = this.payload?.user.companyId;
      if (!companyId || images.length === 0) return
      formData.append('companyId', companyId.toString());
      formData.append('productId', this.productId.toString());
      await firstValueFrom(this.fileService.uploadFile(formData));
      await this.loadProduct(this.productId.toString())
      this.uploading = false
    } catch (error) {
      this.alertServ.show(10000, `Ocurrió un error al subir las imágenes. Por favor, intenta nuevamente`, AlertsType.ERROR);
    }
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

    const keys: string[] = []
    this.nodes.forEach((node) => {
      const areChecked = node?.children?.some((child) => child?.checked)
      if(areChecked) {
        keys.push(node.key)
        node.children?.forEach((child) => {
          if(child.checked) {
            keys.push(child.key)
          }
        })
      } else if(node.checked) {
        keys.push(node.key)
      }
    })
    const productData = {
      ...this.productNewForm.value,
      categoryIds: keys
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
        await this.productServ.create(productData);
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


  // modal image 

  @ViewChild('imageDialog') imageDialog!: ElementRef;


  openDialog() {
    this.imageDialog.nativeElement.showModal();
  }

  closeDialog(e: Event) {
    if (e && e.target === e.currentTarget) {
      this.imageDialog.nativeElement.close();
    }
  }


}
