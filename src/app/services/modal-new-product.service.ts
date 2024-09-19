import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface EditOptions {
  id?: number;
  isOpen: boolean; 
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private _modalState = new BehaviorSubject<EditOptions>({ isOpen: false });
  modalState$ = this._modalState.asObservable();

  private _editSupplierState = new BehaviorSubject<boolean>(false);
  toggleEditSupplier$ = this._editSupplierState.asObservable();

  constructor() {}

  toggleEditSupplier(value: boolean) {
    this._editSupplierState.next(value);
  }

  toggleModal(isOpen: boolean, id?: number) {
    this._modalState.next({ id, isOpen });
  }

  get modalState() {
    return this.modalState$;
  }
}