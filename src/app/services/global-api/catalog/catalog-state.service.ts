import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable({
  providedIn: 'root'
})
export class CatalogStateService {
  private catalogIdSubject = new BehaviorSubject<string | null>(null);
  catalogId$: Observable<string | null> = this.catalogIdSubject.asObservable();

  setCatalogId(id: string): void {
    console.log('Setting CATALOG ID', id);
    this.catalogIdSubject.next(id);
  }

  getCatalogId(): string | null {
    return this.catalogIdSubject.getValue();
  }
}