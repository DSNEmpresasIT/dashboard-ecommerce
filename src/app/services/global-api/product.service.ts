import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { Product } from '../../interfaces/product';

import { AuthService } from '../auth.service';
import { UserAuthPayload } from '../../interfaces/auth';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  GLOBALAPIURL = environment.GLOBALAPIURL;
  private productsSubject = new BehaviorSubject<Product[]>([]);
  products = this.productsSubject.asObservable();
  payload: UserAuthPayload | null = null;

  constructor(private http: HttpClient, authService: AuthService) {
    authService.currentTokenPayload.subscribe(res => this.payload = res)
   }

   header = {
    'Content-Type': 'application/json; charset=utf-8',
    'Accept': 'application/json',
    'authorization': `${this.payload?.token}`,
   }
   
   async create(product: any){
    const products = this.http.post(`${this.GLOBALAPIURL}products`, {...product},
      {
        headers: this.header,
      })
    .subscribe({ 
      next: (products) => products,
      error: (error) => console.error('Error fetching products:', error)
    });
    
    
    return products
  }

  async fetchAllProducts(){
    const products = this.http.get<Product[]>(`${this.GLOBALAPIURL}products/catalog/${this.payload?.user.catalogId}`)
    .subscribe({ 
      next: (products) => this.productsSubject.next(products),
      error: (error) => console.error('Error fetching products:', error)
    });
    
    return products
  }

  async fetchProductById(id: number){
    const products = this.http.get<Product[]>(`${this.GLOBALAPIURL}products/catalog/2/${id}`)
    .subscribe({ 
      next: (products) => this.productsSubject.next(products),
      error: (error) => console.error('Error fetching products by id:', error)
    });
    
    return products
  }

 
  
}
