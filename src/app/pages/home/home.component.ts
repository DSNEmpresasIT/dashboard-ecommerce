import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../interfaces/product';
import { Subscription } from 'rxjs';
import { SupabaseService } from '../../services/supabase/supabase.service';
import { CardProductComponent } from "../../components/card-product/card-product.component";
import { FormProductComponent } from '../../components/form-product/form-product.component';
import { CategoryExploreComponent } from '../../components/category-explore/category-explore.component';
import { FormNewProductComponent } from "../../components/form-new-product/form-new-product.component";
import { ModalNewProductService } from '../../services/modal-new-product.service';
import { HttpClientModule } from '@angular/common/http';
import { FormSupplierComponent } from "../../components/form-supplier/form-supplier.component";

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
  constructor(private supaBase: SupabaseService, private modalToggleService: ModalNewProductService) { }

  ngOnInit() {
   this.supaBase.fetchAllProducts();
    this.productsSubscription = this.supaBase.products.subscribe((res: Product[]) => {
      this.products = res;
      console.log(this.products)
    });

    this.modalToggleService.toggleEditSupplier$.subscribe((value) => {
      this.toggleEditSupplier(value);
    });

    this.modalToggleService.toggle$.subscribe((value) => {
      this.toggleModal(value);
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
