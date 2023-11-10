import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit{
  searcherProducts:FormControl<string | null> = new FormControl<string>('');
  constructor(private supaBase: SupabaseService) {
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

  ngOnInit() {
  }
}
