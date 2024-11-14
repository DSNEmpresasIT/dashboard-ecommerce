import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { AuthService } from '../../../services/auth/auth.service';
import { FormNewProductComponent } from '../../form-new-product/form-new-product.component';
import { ModalService } from '../../../services/modal-new-product.service';
import { Router, RouterModule } from '@angular/router';
import { ProductService } from '../../../services/global-api/catalog/product.service';
import { CUSTOMPATHS } from '../../../enums/routes';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormNewProductComponent, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit{
  searcherProducts:FormControl<string | null> = new FormControl<string>('');
  custompath = CUSTOMPATHS
  constructor(
     public authServ: AuthService,
     private modalToggleService: ModalService,
     private productServ: ProductService,
     public router: Router
     ) {
    this.searcherProducts.valueChanges.pipe(
      debounceTime(600),
      distinctUntilChanged() 
    )
    .subscribe((query)=>{
      const queryString = query || '';
      if(query == ''){
        this.productServ.fetchAllProducts();
      }else {
        this.productServ.fetchProductsByName(query || '');
      }
    })
   }

   toggleModal() {
    this.modalToggleService.toggleModal(true); 
  }

  toggleEditSupplier() {
    this.modalToggleService.toggleEditSupplier(true);
  }

  logout(){
    this.authServ.logout()
  }

  ngOnInit() {
  }
}
