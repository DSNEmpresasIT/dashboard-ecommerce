import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModalNewProductService {
  private _toggleSource = new BehaviorSubject<boolean>(false);
  toggle$ = this._toggleSource.asObservable();

  constructor() {}

  toggleModal(value: boolean) {
    this._toggleSource.next(value);
  }
}
