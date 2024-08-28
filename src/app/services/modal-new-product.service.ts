import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModalNewProductService {
  private _toggleSource = new BehaviorSubject<boolean>(false);
  toggle$ = this._toggleSource.asObservable();

  private _toggleEditSupplier = new BehaviorSubject<boolean>(false);
  toggleEditSupplier$ = this._toggleEditSupplier.asObservable();

  constructor() {}

  toggleEditSupplier(value: boolean) {
    this._toggleEditSupplier.next(value);
  }

  toggleModal(value: boolean) {
    this._toggleSource.next(value);
  }

  get toggle() {
    return this.toggle$;
  }
}
