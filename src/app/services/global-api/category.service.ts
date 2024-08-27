import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AuthService } from '../auth.service';
import { Category } from '../../interfaces/product';
import { BehaviorSubject, catchError, map, Observable, of, throwError } from 'rxjs';
import { CategoryDTO } from '../../interfaces/catalogsDTO';
import { UserAuthPayload } from '../../interfaces/auth';

@Injectable({
  providedIn: 'root'
})

export class CategoryService {
  GLOBALAPIURL = environment.GLOBALAPIURL;
  private categorySubject = new BehaviorSubject<Category[]>([]);
  category = this.categorySubject.asObservable();
  payload: UserAuthPayload | null = null;
   
  constructor(private http: HttpClient, authService: AuthService) {
    authService.currentTokenPayload.subscribe(res => this.payload = res)
  }


  fetchCategories(categoryId?: number): Observable<Category[]> {
    let params = new HttpParams();
    if (categoryId !== undefined) {
      params = params.set('categoryId', categoryId.toString());
    }

    const url = `${this.GLOBALAPIURL}catalog/categories/${this.payload?.user.catalogId}`;

    return this.http.get<Category[]>(url, { params }).pipe(
      catchError(error => {
       throw new Error(`Error fetching categories: ${error.message}`)
      }),
      map(categories => {
        if (categoryId !== undefined) {
          console.log(categories, ' categories en map')
          return categories; 
        } else {
          console.log(categories, ' categories en else')
          this.categorySubject.next(categories);
          return [];
        }
      })
    );
  }

  get categories$() {
    return this.categorySubject.asObservable();
  }


  create(category: CategoryDTO): Observable<CategoryDTO> {
    if (!this.payload) {
      throw new Error('The catalog ID was not defined');
    }

    const data = {
      ...category,
      catalogId: this.payload.user.catalogId,
    };

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.payload.token}`
    });

    console.log('Enviado al backend', data);

    return this.http.post<CategoryDTO>(`${this.GLOBALAPIURL}catalog/categories/`, data, { headers })
      .pipe(
        catchError(error => {
          console.error('Error creating category:', error);
          throw new Error('Error creating category: ' + error.message)
        })
      );
  }
}
