import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { Product } from '../../interfaces/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  GLOBALAPIURL = environment.GLOBALAPIURL;
  private productsSubject = new BehaviorSubject<Product[]>([]);
  products = this.productsSubject.asObservable();
  constructor(private http: HttpClient) { }

  async fetchAllProducts(){
    const products = this.http.get<Product[]>(`${this.GLOBALAPIURL}products/catalog/3`)
    .subscribe({ 
      next: (products) => this.productsSubject.next(products),
      error: (error) => console.error('Error fetching products:', error)
    });
    
    return products
  }

  async fetchProductById(id: number){
    const products = this.http.get<Product[]>(`${this.GLOBALAPIURL}products/catalog/3/${id}`)
    .subscribe({ 
      next: (products) => this.productsSubject.next(products),
      error: (error) => console.error('Error fetching products by id:', error)
    });
    
    return products
  }
  
}
