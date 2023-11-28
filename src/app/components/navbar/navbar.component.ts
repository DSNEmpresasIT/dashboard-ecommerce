import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase/supabase.service';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { FormNewProductComponent } from '../form-new-product/form-new-product.component';
import { ModalNewProductService } from '../../services/modal-new-product.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormNewProductComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit{
  searcherProducts:FormControl<string | null> = new FormControl<string>('');
  constructor(private supaBase: SupabaseService, public authServ: AuthService, private modalToggleService: ModalNewProductService) {
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

  ngOnInit() {
  }
}
