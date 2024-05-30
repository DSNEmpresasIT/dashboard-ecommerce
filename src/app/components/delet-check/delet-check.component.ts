import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { AlertService, AlertsType } from '../../services/alert.service';
import { SupabaseService } from '../../services/supabase/supabase.service';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../services/supabase/category.service';

@Component({
  selector: 'app-delet-check',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './delet-check.component.html',
  styleUrl: './delet-check.component.css'
})
export class DeletCheckComponent {
  @Input({required: true}) id: number | null = null ;
  @Input({required: true}) itemName: string | null = null;

  @Output() handleGetCategories = new EventEmitter<any>();

  @ViewChild('updateButton') updateButton!: ElementRef;
  @ViewChild('cancelButton') cancelButton!: ElementRef;
  @ViewChild('favDialog') favDialog!: ElementRef;
  load: boolean = false;
  typedName: string = '';
  error: boolean = false;

  constructor(private categoriServ: CategoryService){}

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

  confirmDelete() {
    if (this.typedName === this.itemName?.trim()) {
      if (this.id ) {
       this.categoriServ.deleteCategory(this.id)
       this.closeDialog();
       this.handleGetCategories.emit();
      }
    } else {
      this.error = true;
    }
  }
  
}
