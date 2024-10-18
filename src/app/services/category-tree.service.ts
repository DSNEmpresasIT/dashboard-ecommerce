import { Injectable, Signal, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CategoryTreeDTO } from '../components/category-tree/category-tree.component';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class CategoryTreeService {
  private selectedCategoryIds = signal<number[]>([]);

  constructor(private http: HttpClient) {}

  getProductWithCategories(catalogId: number, productId: number): Observable<any> {
    return this.http.get<any>(`/api/products/catalog/${catalogId}/${productId}?withCategoryRoot=true`);
  }

  getCategoryChildren(categoryId?: number): Observable<any[]> {
    let option = `?categoryId=${categoryId}`
    const baseSetting = `${environment.GLOBALAPIURL}catalog/categories/1`;
    return this.http.get<any[]>(categoryId ? `${baseSetting + option}` : `${baseSetting}`);
  }

  setSelectedCategories(categoryIds: number[]): void {
    this.selectedCategoryIds.set(categoryIds);
  }

  get selectedCategoriesSignal(): Signal<number[]> {
    return this.selectedCategoryIds;
  }

  toggleCategorySelection(categoryId: number): void {
    const currentSelected = this.selectedCategoryIds();
    const index = currentSelected.indexOf(categoryId);
    if (index > -1) {
      this.selectedCategoryIds.set([...currentSelected.slice(0, index), ...currentSelected.slice(index + 1)]);
    } else {
      this.selectedCategoryIds.set([...currentSelected, categoryId]);
    }
  }

  markCategoryTree(node: CategoryTreeDTO): CategoryTreeDTO {
    node.selected = this.selectedCategoryIds().includes(node.id);

    if (node.childrens && node.childrens.length > 0) {
      node.childrens = node.childrens.map(child => this.markCategoryTree(child));
    }

    return node;
  }
}
