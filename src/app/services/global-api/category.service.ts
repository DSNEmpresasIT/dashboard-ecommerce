import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth.service';
import { Category } from '../../interfaces/product';
import { BehaviorSubject } from 'rxjs';
import { TokenPayload } from '../../interfaces/auth';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  GLOBALAPIURL = environment.GLOBALAPIURL;
  private categorySubject = new BehaviorSubject<Category[]>([]);
  category = this.categorySubject.asObservable();
  payload: TokenPayload | null = null;
  constructor(private http: HttpClient, authService: AuthService) {
    authService.currentTokenPayload.subscribe(res => this.payload = res)
  }

  async fetchCategories(category?: number){
    const products = this.http.get<Category[]>(`${this.GLOBALAPIURL}catalog/categories/${this.payload?.catalogId}`)
    .subscribe({ 
      next: (products) =>  this.categorySubject.next(products),
      error: (error) => console.error('Error fetching products by id:', error)
    });
    
    return products
  }
}
