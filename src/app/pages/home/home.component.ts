import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../interfaces/product';
import { Subscription } from 'rxjs';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy{
  products: Product[] | undefined;
  private productsSubscription: Subscription = new Subscription();
  toggleForm:boolean = false;
  constructor(private supaBase: SupabaseService) { }

  ngOnInit() {
   this.supaBase.fetchAllProducts();
    this.productsSubscription = this.supaBase.products.subscribe((res: Product[]) => {
      this.products = res;
      console.log(this.products)
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
  
}
