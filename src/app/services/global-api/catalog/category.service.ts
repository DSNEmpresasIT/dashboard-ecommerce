import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AuthService } from '../../auth/auth.service';
import { Category } from '../../../interfaces/product';
import { BehaviorSubject, catchError, map, Observable, of, throwError } from 'rxjs';
import { CategoryDTO } from '../../../interfaces/catalogsDTO';
import { UserAuthPayload } from '../../../interfaces/auth';
import { AlertService, AlertsType } from '../../alert.service';
import { CatalogStateService } from './catalog-state.service';

@Injectable({
  providedIn: 'root'
})

export class CategoryService {
  GLOBALAPIURL = environment.GLOBALAPIURL;
  private categorySubject = new BehaviorSubject<Category[]>([]);
  category = this.categorySubject.asObservable();
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
  
  fetchCategories(categoryId?: number): Observable<Category[]> {
    let params = new HttpParams();
    if (categoryId !== undefined) {
      params = params.set('categoryId', categoryId.toString());
    }

    const url = `${this.GLOBALAPIURL}catalog/categories/${this.catalogId}`;

    return this.http.get<Category[]>(url, { params, 
      headers: this.authService.getAuthHeaders(),}).pipe(
      catchError(error => {
        this.alertServ.show(6000, `Error en la búsqueda de categorías: ${error.message}`, AlertsType.ERROR);
        return throwError(() => new Error(`Error fetching categories: ${error.message}`));
      }),
      map(categories => {
        if (categoryId !== undefined) {
          return categories; 
        } else {
          this.categorySubject.next(categories);
          return [];
        }
      })
    );
  }

  getCategories(categoryId?: number): Observable<Category[]> {
    let params = new HttpParams();
    if (categoryId !== undefined) {
      params = params.set('categoryId', categoryId.toString());
    }

    const url = `${this.GLOBALAPIURL}catalog/categories/${this.catalogId}`;

    return this.http.get<Category[]>(url, { params ,
      headers: this.authService.getAuthHeaders(),
    })
  }

  get categories$() {
    return this.categorySubject.asObservable();
  }

  create(category: CategoryDTO): Observable<CategoryDTO> {
    if (!this.catalogId) {
      throw new Error('The catalog ID was not defined');
    }
    const data = {
      ...category,
      catalogId: parseInt(this.catalogId),
    };
    return this.http.post<CategoryDTO>(`${this.GLOBALAPIURL}catalog/categories/`, data, { headers: this.authService.getAuthHeaders() })
      .pipe(
        catchError(error => {
          this.alertServ.show(9000, `Error al crear categoría: ${error.message}`, AlertsType.ERROR);
          return throwError(() => new Error('Error creating category: ' + error.message));
        }),
        map(response => {
          this.alertServ.show(6000, 'Categoría creada correctamente', AlertsType.SUCCESS);
          return response;
        })
      );
  }

  updateCategory(category: CategoryDTO) {
    if (!this.payload) {
      throw new Error('The catalog ID was not defined');
    }
    console.log(category)
    let data: CategoryDTO = {
      id: category.id,
      catalogId: this.payload.user.catalogId,
      label: category.label,
      value: category.value,
    };
  
    if (category.fatherCategoryId) {
      data.fatherCategoryId = category.fatherCategoryId;
    }
  
    return this.http.patch<CategoryDTO>(`${this.GLOBALAPIURL}catalog/categories`, data, { headers: this.authService.getAuthHeaders() })
      .pipe(
        catchError(error => {
          this.alertServ.show(9000, `Error al editar la categoría: ${error.message}`, AlertsType.ERROR);
          return throwError(() => new Error('Error al editar la categoría: ' + error.message));
        }),
        map(response => {
          this.alertServ.show(6000, 'Categoría edidata correctamente', AlertsType.SUCCESS);
          return response;
        })
      );
  }
  

  deleteCategory(categoryId: number): Observable<void> {
    const url = `${this.GLOBALAPIURL}catalog/categories/${categoryId}`;
    return this.http.delete<void>(url, { headers: this.authService.getAuthHeaders() }).pipe(
      catchError(error => {
        this.alertServ.show(9000, `Error al borrar una categoría: ${error.message}`, AlertsType.ERROR);
        return throwError(() => new Error(`Error deleting category: ${error.message}`));
      }),
      map(() => {
        this.alertServ.show(6000, 'Categoría eliminada correctamente', AlertsType.SUCCESS);
      })
    );
  }
}
