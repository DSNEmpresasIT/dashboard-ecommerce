import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../interfaces/product';
import { Subscription } from 'rxjs';
import { SupabaseService } from '../../services/supabase/supabase.service';
import { CardProductComponent } from "../../components/card-product/card-product.component";
import { FormProductComponent } from '../../components/form-product/form-product.component';
import { CategoryExploreComponent } from '../../components/category-explore/category-explore.component';
import { FormNewProductComponent } from "../../components/form-new-product/form-new-product.component";
import { ModalService } from '../../services/modal-new-product.service';
import { HttpClientModule } from '@angular/common/http';
import { FormSupplierComponent } from "../../components/form-supplier/form-supplier.component";
import { CategoryService } from '../../services/global-api/category.service';
import { ProductService } from '../../services/global-api/product.service';

@Component({
    selector: 'app-home',
    standalone: true,
    templateUrl: './home.component.html',
    styleUrl: './home.component.css',
    imports: [CommonModule, CardProductComponent, FormProductComponent, CategoryExploreComponent, FormNewProductComponent, HttpClientModule, FormSupplierComponent]
})
export class HomeComponent implements OnInit, OnDestroy{

  products: Product[] | undefined;
  private productsSubscription: Subscription = new Subscription();
  toggleFormSupplier:boolean = false;
  toggleForm:boolean = false;
  toggleFormNewProduct:boolean = false
  constructor(
     private supaBase: SupabaseService,
     private modalToggleService: ModalService,
     private productApi: ProductService 
    ){ }

  ngOnInit() {
    console.log(
   this.productApi.fetchAllProducts(), 'products'
    )
    this.productsSubscription = this.productApi.products.subscribe((res: Product[]) => {
      this.products = res;
      console.log(this.products)
    });

    this.modalToggleService.toggleEditSupplier$.subscribe((value) => {
      this.toggleEditSupplier(value);
    });

    this.modalToggleService.modalState$.subscribe((value) => {
      this.toggleModal(value.isOpen);
    });
  }

  ngOnDestroy(): void {
    if (this.productsSubscription) {
      this.productsSubscription.unsubscribe();
    }
  }

  handleBooleanValue(value: boolean) {
    this.toggleForm = !this.toggleForm
    console.log('Valor booleano recibido:', value);
  }

  toggleEditSupplier(value: boolean) {
    this.toggleFormSupplier = value;
  }
  
  toggleModal(value: boolean) {
    this.toggleFormNewProduct = value;
  }
}
