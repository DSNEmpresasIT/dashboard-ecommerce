import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AuthService } from '../../auth/auth.service';
import { Catalog, Category } from '../../../interfaces/product';
import { BehaviorSubject, catchError, map, Observable, of, throwError } from 'rxjs';
import { CategoryDTO, CreateCatalogDTO } from '../../../interfaces/catalogsDTO';
import { UserAuthPayload } from '../../../interfaces/auth';
import { AlertService, AlertsType } from '../../alert.service';
import { CatalogStateService } from './catalog-state.service';

@Injectable({
  providedIn: 'root'
})

export class CatalogService {
  GLOBALAPIURL = environment.GLOBALAPIURL;
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
  
  create(catalog: CreateCatalogDTO): Observable<CreateCatalogDTO> {
    if (!this.payload) {
      throw new Error('The catalog ID was not defined');
    }

    const data = {
      ...catalog,
      companyId: this.payload.user.companyId,
    };

    return this.http.post<CreateCatalogDTO>(`${this.GLOBALAPIURL}catalogs`, data, { headers: this.authService.getAuthHeaders() })
      .pipe(
        catchError(error => {
          this.alertServ.show(9000, `Error al crear el Catalogo: ${error.message}`, AlertsType.ERROR);
          return throwError(() => new Error('Error creating catalog: ' + error.message));
        }),
        map(response => {
          this.alertServ.show(6000, 'Catalogo creado correctamente', AlertsType.SUCCESS);
          return response;
        })
      );
  }

  update(catalog: Catalog) {
    if (!this.payload) {
      throw new Error('The catalog ID was not defined');
    }

    const data = {
      companyId: this.payload.user.companyId,
      ...catalog
    }
  
    return this.http.patch<Catalog>(`${this.GLOBALAPIURL}catalogs`, data, { headers: this.authService.getAuthHeaders() })
      .pipe(
        catchError(error => {
          this.alertServ.show(9000, `Error al editar el catalogo: ${error.message}`, AlertsType.ERROR);
          return throwError(() => new Error('Error al editar el catalogo: ' + error.message));
        }),
        map(response => {
          this.alertServ.show(6000, 'catalogo edidato correctamente', AlertsType.SUCCESS);
          return response;
        })
      );
  }
  

  delete(catalog: Catalog): Observable<void> {
    const url = `${this.GLOBALAPIURL}catalogs/${catalog.id}`;
    return this.http.delete<void>(url, { headers: this.authService.getAuthHeaders() }).pipe(
      catchError(error => {
        this.alertServ.show(9000, `Error al borrar el catalogo: ${catalog.name}`, AlertsType.ERROR);
        return throwError(() => new Error(`Error deleting catalog: ${error.message}`));
      }),
      map(() => {
        this.alertServ.show(6000, 'Catalogo eliminado correctamente', AlertsType.SUCCESS);
      })
    );
  }
}
