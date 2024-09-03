import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, throwError } from 'rxjs';
import { Product } from '../../interfaces/product';

import { AuthService } from '../auth.service';
import { UserAuthPayload } from '../../interfaces/auth';
import { AlertService, AlertsType } from '../alert.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  GLOBALAPIURL = environment.GLOBALAPIURL;
  private productsSubject = new BehaviorSubject<Product[]>([]);
  products = this.productsSubject.asObservable();
  payload: UserAuthPayload | null = null;

  constructor(private http: HttpClient,
     private authService: AuthService,
     private alertServ: AlertService) {
    authService.currentTokenPayload.subscribe(res => this.payload = res)
   }

   header = {
    'Content-Type': 'application/json; charset=utf-8',
    'Accept': 'application/json',
    'authorization': `${this.payload?.token}`,
   }
   
   async create(product: any) {
    const products = this.http.post(`${this.GLOBALAPIURL}products`, { ...product },
      {
        headers: this.authService.getAuthHeaders(),
      })
      .subscribe({
        next: (products) => {
          this.alertServ.show(6000, 'Producto creado exitosamente', AlertsType.SUCCESS);
          return products;
        },
        error: (error) => {
          console.error('Error creating product:', error);
          this.alertServ.show(9000, 'Error al crear el producto', AlertsType.ERROR);
        }
      });
  
    return products;
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

  deleteProduct(productId: number): Observable<void> {
    const url = `${this.GLOBALAPIURL}products/${productId}`;
    return this.http.delete<void>(url, { headers: this.authService.getAuthHeaders() }).pipe(
      catchError(error => {
        this.alertServ.show(9000, `Error al borrar un producto: ${error.message}`, AlertsType.ERROR);
        return throwError(() => new Error(`Error deleting product: ${error.message}`));
      }),
      map(() => {
        this.alertServ.show(6000, 'producto eliminado correctamente', AlertsType.SUCCESS);
      })
    );
  }
  
}
