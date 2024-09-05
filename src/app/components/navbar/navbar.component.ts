import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase/supabase.service';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { FormNewProductComponent } from '../form-new-product/form-new-product.component';
import { ModalService } from '../../services/modal-new-product.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormNewProductComponent, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit{
  searcherProducts:FormControl<string | null> = new FormControl<string>('');
  constructor(private supaBase: SupabaseService,
     public authServ: AuthService,
     private modalToggleService: ModalService,
     ) {
    this.searcherProducts.valueChanges.pipe(
      debounceTime(600),
      distinctUntilChanged() 
    )
    .subscribe((query)=>{
      const queryString = query || '';
      if(query == ''){
        this.supaBase.fetchAllProducts();
      }else {
        this.supaBase.fetchProductsByName(query || '');
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
