import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { Product } from '../../../interfaces/product';
import { UserAuthPayload } from '../../../interfaces/auth';
import { AuthService } from '../../auth/auth.service';
import { AlertService, AlertsType } from '../../alert.service';
import { CatalogStateService } from './catalog-state.service';


@Injectable({
  providedIn: 'root'
})
export class ProductService {
  GLOBALAPIURL = environment.GLOBALAPIURL;
  private productsSubject = new BehaviorSubject<Product[]>([]);
  products = this.productsSubject.asObservable();
  payload: UserAuthPayload | null = null;
  catalogId: string | null = null

  constructor(private http: HttpClient,
     private authService: AuthService,
     private alertServ: AlertService,
     private catalogState: CatalogStateService) {
    authService.currentTokenPayload.subscribe(res => this.payload = res);
    this.catalogState.catalogId$.subscribe(id => {
      this.catalogId = id;
    });
   }

   header = {
    'Content-Type': 'application/json; charset=utf-8',
    'Accept': 'application/json',
    'authorization': `${this.payload?.token}`,
   }
   
   async create(product: any) {

    if (!this.payload) {
      throw new Error('The catalog ID was not defined');
    }

    const data = {
      ...product,
      catalogId: this.payload.user.catalogId,
    };

    const products = this.http.post(`${this.GLOBALAPIURL}products`, { ...data },
      {
        headers: this.authService.getAuthHeaders(),
      })
      .subscribe({
        next: (products) => {
          this.alertServ.show(6000, 'Producto creado exitosamente', AlertsType.SUCCESS);
          this.fetchAllProducts();
          return products;
        },
        error: (error) => {
          console.error('Error creating product:', error);
          this.alertServ.show(9000, 'Error al crear el producto', AlertsType.ERROR);
        }
      });
  
    return products;
  }


  async edit(id: number, product: any){
      try {
        if (!this.payload) {
          throw new Error('The catalog ID was not defined');
        }

        let data = {
          ...product,
          catalogId: this.payload.user.catalogId,
          productId: id,
        }
        console.log(data, 'editando')
        const products = this.http.put<Product[]>(`${this.GLOBALAPIURL}products`,{...data},{
          headers: this.authService.getAuthHeaders(),
        }).subscribe()

        if(product)
          this.alertServ.show(9000, `Producto creado con exito`, AlertsType.SUCCESS);
        
        return products
      } catch (error: any) {
        this.alertServ.show(9000, `Error al editar el producto: ${error.message}`, AlertsType.ERROR);
        return console.error(`Error al editar el producto: ${error.message}`)
      }
  }
  

  async fetchAllProducts(){
    const products = this.http.get<Product[]>(`${this.GLOBALAPIURL}products/catalog/${this.catalogId}`)
    .subscribe({ 
      next: (products) => this.productsSubject.next(products),
      error: (error) => console.error('Error fetching products:', error)
    });
    
    return products
  }

  fetchProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.GLOBALAPIURL}products/catalog/${this.catalogId}/${id}?withCategoryRoot=true`);
  }

  fetchProductByCategoryId(id: number){
    const product = this.http.get<Product[]>(`${this.GLOBALAPIURL}products/${this.catalogId}/${id}`).subscribe({ 
      next: (products) => this.productsSubject.next(products),
      error: (error) => console.error('Error fetching products by categoryId:', error)
    });;

    return product
  }

  fetchProductsByName(query: string){
    const products = this.http.get<Product[]>(`${this.GLOBALAPIURL}products/search/${this.catalogId}/${query}`)
    .subscribe({ 
      next: (products) => this.productsSubject.next(products),
      error: (error) => console.error('Error fetching products:', error)
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
