import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../interfaces/product';
import { SupabaseService } from '../../services/supabase/supabase.service';

@Component({
  selector: 'app-card-product',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-product.component.html',
  styleUrl: './card-product.component.css'
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
