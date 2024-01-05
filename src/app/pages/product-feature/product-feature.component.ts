import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductSingleService } from '../../services/supabase/product-single.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProductFeature } from '../../interfaces/productSingle';
import { ActivatedRoute, RouterModule } from '@angular/router';

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

  constructor(
    private productServ: ProductSingleService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute
  ) {
    this.productSingle = this.formBuilder.group({
      id:[''],
      product_id: [''],
      description: [''],
      activeIngredient: [''],
      modeOfAction: [''],
      actionSite: [''],
      toxicologicalClassification: [''],
      formulation: [''],
      weedType: [''],
      pdffiles: [''],
      applicationTimingCrops: [''],
      applicationTimingWeeds: [''],
      actionForm: [''],
      applicationLocation: [''],
      safetyDataSheet: [''],
      downloadMarbete: [''],
      downloadCommercialFlyer: [''],
    });
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const categoryParam = params.get('id');
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
    if(this.productSingle.valid){
      this.productServ.updateProductSingle(this.productSingle.value)
    }
  }
}
