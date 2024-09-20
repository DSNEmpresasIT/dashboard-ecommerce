import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../services/global-api/category.service';
import { DeletTypes } from '../../enums/enums';
import { deleteConfig } from '../../interfaces/interfaces';
import { ProductService } from '../../services/global-api/product.service';


@Component({
  selector: 'app-delet-check',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './delet-check.component.html',
  styleUrl: './delet-check.component.css'
})
export class DeletCheckComponent {
  @Input({ required: true }) config!: deleteConfig;
  @Output() handleGetCategories = new EventEmitter<any>();
  @ViewChild('favDialog') favDialog!: ElementRef;
  
  load: boolean = false;
  typedName: string = '';
  error: boolean = false;

  constructor(private categoriServ: CategoryService,
     private productServ: ProductService) {}

  openDialog() {
    this.favDialog.nativeElement.showModal();
  }

  closeDialog() {
    this.favDialog.nativeElement.close();
  }

  confirmDelete() {
    const { id, itemName, toDelete } = this.config;

    if (this.typedName === itemName?.trim() && id) {
      switch (toDelete) {
        case DeletTypes.CATEGORY:
          this.categoriServ.deleteCategory(id).subscribe(() => {
            this.closeDialog();
            this.handleGetCategories.emit();
          });
          break;
        case DeletTypes.PRODUCT:
            this.productServ.deleteProduct(id).subscribe(() => {
              this.closeDialog();
              this.handleGetCategories.emit();
            });
          break;
        default:
          // Manejar otros casos si es necesario
          break;
      }
    } else {
      this.error = true;
    }
  }
}
