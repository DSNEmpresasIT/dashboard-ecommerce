import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase/supabase.service';
import { AlertService, AlertsType } from '../../services/alert.service';

@Component({
  selector: 'app-modal-delet',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-delet.component.html',
})
export class ModalDeletComponent {
  @Input({required: true}) id!: number | undefined; 
  @ViewChild('updateButton') updateButton!: ElementRef;
  @ViewChild('cancelButton') cancelButton!: ElementRef;
  @ViewChild('favDialog') favDialog!: ElementRef;


  constructor(
    private supabase : SupabaseService,
    private alertServ : AlertService,
    ){}

  ngAfterViewInit() {
    this.updateButton.nativeElement.addEventListener('click', () => {
      this.favDialog.nativeElement.showModal();
    });

    this.cancelButton.nativeElement.addEventListener('click', () => {
      this.favDialog.nativeElement.close();
    });
  }
 

  openDialog() {
    this.favDialog.nativeElement.showModal();
  }

  closeDialog() {
    this.favDialog.nativeElement.close();
  }

   load : boolean = false

   async deletProduct(id: number | undefined) {
    this.load = true;
    try {
      await this.supabase.deleteProduct(id);
      this.load = false;
      this.closeDialog();
    } catch (error) {
      console.error("Error deleting product:", error);
      this.load = false;
      this.alertServ.show(6000, "Error al eliminar el producto", AlertsType.ERROR);
    }
  }

}
