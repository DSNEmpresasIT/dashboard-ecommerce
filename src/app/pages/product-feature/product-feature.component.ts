import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductSingleService } from '../../services/supabase/product-single.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProductFeature } from '../../interfaces/productSingle';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CloudinaryService } from '../../services/cloudinary.service';
import { ButtonSpinerComponent } from "../../components/button-spiner/button-spiner.component";

export enum COMPONENTSS{ 
  MAIN_INFORMATION = 'Main Information',
  TECHNICAL_DETAILS = 'Technical Details',
  DOWNLOAD_LINKS = 'Download Links'
}

@Component({
    selector: 'app-product-feature',
    standalone: true,
    templateUrl: './product-feature.component.html',
    styleUrl: './product-feature.component.css',
    imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, ButtonSpinerComponent]
})
export class ProductFeatureComponent implements OnInit {
  productSingle: FormGroup;
  renderProductSingle: ProductFeature | undefined | null; 
  productName: string | null | undefined;
  readonly COMPONENTS = COMPONENTSS
  componentsToRender: COMPONENTSS = this.COMPONENTS.TECHNICAL_DETAILS
  isLoading: boolean = false
  pdfFiles: { [key: string]: File } = {}; 

  switchComponentsToRender(componentToRender: COMPONENTSS){
    this.componentsToRender = componentToRender
  }

  constructor(
    private productServ: ProductSingleService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private cloudinaryServ: CloudinaryService
  ) {
    this.productSingle = this.formBuilder.group({
      id:[''],
      product_id: [null],
      description: [null],
      activeIngredient: [null],
      modeOfAction: [null],
      actionSite: [null],
      toxicologicalClassification: [null],
      formulation: [null],
      weedType: [null],
      pdffiles: [null],
      applicationTimingCrops: [null],
      applicationTimingWeeds: [null],
      actionForm: [null],
      applicationLocation: [null],
      safetyDataSheet: [null],
      downloadMarbete: [''],
      downloadCommercialFlyer: [''],
    });
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const categoryParam = params.get('id');
      if (categoryParam) {
        const updatedProductSingleValue = { ...this.productSingle.value, product_id: categoryParam };
        this.productSingle.setValue(updatedProductSingleValue);
      }
      this.productName = params.get('name')
      this.getProductSingle(categoryParam as string);
    });
  }


  getProductSingle(productId: string) {
    console.log(productId, 'productid')
    if (productId) {
      this.productServ.getProductSingleById(productId)
        .then((data) => {
          this.renderProductSingle = data;
          console.log(data, 'data')
          this.updateFormValues();
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }

  private updateFormValues() {
    console.log(this.renderProductSingle, 'render product Single')
    if (this.renderProductSingle) {
      this.productSingle.patchValue({
        id: this.renderProductSingle.id || undefined,
        product_id: this.renderProductSingle.product_id || undefined,
        description: this.renderProductSingle.description || undefined,
        activeIngredient: this.renderProductSingle.activeIngredient || undefined,
        modeOfAction: this.renderProductSingle.modeOfAction || undefined,
        actionSite: this.renderProductSingle.actionSite || undefined,
        toxicologicalClassification: this.renderProductSingle.toxicologicalClassification || undefined,
        formulation: this.renderProductSingle.formulation || undefined,
        weedType: this.renderProductSingle.weedType || undefined,
        pdffiles: this.renderProductSingle.pdffiles || undefined,
        applicationTimingCrops: this.renderProductSingle.applicationTimingCrops || undefined,
        applicationTimingWeeds: this.renderProductSingle.applicationTimingWeeds || undefined,
        actionForm: this.renderProductSingle.actionForm || undefined,
        applicationLocation: this.renderProductSingle.applicationLocation || undefined,
        safetyDataSheet: this.renderProductSingle.safetyDataSheet || undefined,
        downloadMarbete: this.renderProductSingle.downloadMarbete || undefined,
        downloadCommercialFlyer: this.renderProductSingle.downloadCommercialFlyer || undefined,
      });
    }
  }


  onPDFFileSelected(event: any, fieldName: string) {
    const file = event.target.files[0];
    console.log(file, 'archivo en file')
    if (file) {
      this.pdfFiles[fieldName] = file;
    }
  }

  async onSubmit() {
    if (this.productSingle.valid) {
      this.isLoading = true;
      const data = this.productSingle.value;

      const uploadAndUpdate = async (fieldName: string) => {
        const oldUrl = data[fieldName];
        if (oldUrl) {
          const publicId = this.cloudinaryServ.extractPublicIdFromUrl(oldUrl);
          if (publicId) {
            await this.cloudinaryServ.deleteFile(publicId).toPromise();
          }
        }
        if (this.pdfFiles[fieldName]) {
          const response = await this.cloudinaryServ.uploadPDF(this.pdfFiles[fieldName]).toPromise();
          data[fieldName] = response.secure_url;
        }
      };

      const uploadPromises = [
        uploadAndUpdate('pdffiles'),
        uploadAndUpdate('safetyDataSheet'),
        uploadAndUpdate('downloadMarbete'),
        uploadAndUpdate('downloadCommercialFlyer')
      ];

      try {
        await Promise.all(uploadPromises);
        if (data.id === '') {
          delete data.id;
        }
        await this.productServ.updateProductSingle(data);
        console.log('Datos actualizados correctamente en Supabase.');
        this.isLoading = false;
        this.getProductSingle(data.id)
      } catch (error) {
        this.isLoading = false;
        console.error('Error al actualizar datos:', error);
        alert('Hubo un error al actualizar los datos. Por favor, inténtelo de nuevo.');
      }
    }
  }
}
