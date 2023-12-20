import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../interfaces/product';
import { SupabaseService } from '../../services/supabase/supabase.service';
import { ModalDeletComponent } from "../modal-delet/modal-delet.component";
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-card-product',
    standalone: true,
    templateUrl: './card-product.component.html',
    styleUrl: './card-product.component.css',
    imports: [CommonModule, ModalDeletComponent, RouterModule]
})
export class CardProductComponent {
  @Input() renderProduct: Product | undefined;
  @Output() booleanOutput: EventEmitter<boolean> = new EventEmitter<boolean>();
  constructor(private supaBase : SupabaseService) { }
  toggleForm: boolean= false;
  ngOnInit() {
    
  }

  getProductId(id:number){
    this.supaBase.getProductById(id)
    this.booleanOutput.emit();
  }

}
