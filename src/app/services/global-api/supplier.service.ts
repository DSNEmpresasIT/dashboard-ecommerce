import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {

  constructor() { }

  getSuppliers(){
    throw new Error('method not implemented')
  }

  
}
