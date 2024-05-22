import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductSingleService } from '../../services/supabase/product-single.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProductFeature } from '../../interfaces/productSingle';
import { ActivatedRoute, RouterModule } from '@angular/router';

export enum COMPONENTSS{ 
  MAIN_INFORMATION = 'Main Information',
  TECHNICAL_DETAILS = 'Technical Details',
  DOWNLOAD_LINKS = 'Download Links'
}

@Component({
  selector: 'app-product-feature',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './product-feature.component.html',
  styleUrl: './product-feature.component.css'
})
export class ProductFeatureComponent implements OnInit {
  productSingle: FormGroup;
  renderProductSingle: ProductFeature | undefined | null; 
  productName: string | null | undefined;
  readonly COMPONENTS = COMPONENTSS
  componentsToRender: COMPONENTSS = this.COMPONENTS.TECHNICAL_DETAILS

  switchComponentsToRender(componentToRender: COMPONENTSS){
    this.componentsToRender = componentToRender
  }

  constructor(
    private productServ: ProductSingleService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute
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

  onSubmit(){
    const data = this.productSingle.value
    if (data.id === '') {
      delete data.id;
    }
    if(this.productSingle.valid){
      this.productServ.updateProductSingle(this.productSingle.value)
    }
  }
}
