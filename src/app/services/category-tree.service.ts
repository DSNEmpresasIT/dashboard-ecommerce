import { Injectable, Signal, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CategoryTreeDTO } from '../components/category-tree/category-tree.component';
import { environment } from '../../environments/environment.development';
import { UserAuthPayload } from '../interfaces/auth';
import { AuthService } from './auth/auth.service';
import { CatalogStateService } from './global-api/catalog/catalog-state.service';

export interface SelectedCategory {
  id: number;
  label: string;
}

@Injectable({
  providedIn: 'root',
})
export class CategoryTreeService {
  private selectedCategories = signal<SelectedCategory[]>([]);
  payload: UserAuthPayload | null = null;
  catalogId: string | null = null

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private catalogState: CatalogStateService) {
    authService.currentTokenPayload.subscribe(res => this.payload = res)

    authService.currentTokenPayload.subscribe(res => this.payload = res);
    this.catalogState.catalogId$.subscribe(id => {
      this.catalogId = id;
    });
  }

  getProductWithCategories(catalogId: number, productId: number): Observable<any> {
    return this.http.get<any>(`/api/products/catalog/${this.catalogId}/${productId}?withCategoryRoot=true`, { headers: this.authService.getAuthHeaders() });
  }

  getCategoryChildren(categoryId?: number): Observable<any[]> {
    let option = `?categoryId=${categoryId}`;
    const baseSetting = `${environment.GLOBALAPIURL}catalog/categories/${this.catalogId}`;
    return this.http.get<any[]>(categoryId ? `${baseSetting + option}` : `${baseSetting}` , { headers: this.authService.getAuthHeaders() } );
  }

  setSelectedCategories(categories: SelectedCategory[]): void {
    this.selectedCategories.set(categories);
  }

  get selectedCategoriesSignal(): Signal<SelectedCategory[]> {
    return this.selectedCategories;
  }

  toggleCategorySelection(category: SelectedCategory): void {
    const currentSelected = this.selectedCategories();
    const index = currentSelected.findIndex(cat => cat.id === category.id);

    if (index > -1) {
      this.selectedCategories.set([...currentSelected.slice(0, index), ...currentSelected.slice(index + 1)]);
    } else {
      this.selectedCategories.set([...currentSelected, category]);
    }
  }

  markCategoryTree(node: CategoryTreeDTO): CategoryTreeDTO {
    node.selected = this.selectedCategories().some(cat => cat.id === node.id);

    if (node.childrens && node.childrens.length > 0) {
      node.childrens = node.childrens.map(child => this.markCategoryTree(child));
    }

    return node;
  }
}
