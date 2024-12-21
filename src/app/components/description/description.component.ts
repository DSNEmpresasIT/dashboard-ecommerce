import { CommonModule } from '@angular/common';
import { Component, inject, Input, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularEditorConfig, AngularEditorModule } from '@kolkov/angular-editor';
import { ProductService } from '../../services/global-api/catalog/product.service';

@Component({
  selector: 'app-description',
  standalone: true,
  imports: [AngularEditorModule, FormsModule],
  templateUrl: './description.component.html',
  styleUrl: './description.component.css',
  encapsulation: ViewEncapsulation.None
})
export class DescriptionComponent {
  @Input() value!: string
  productService = inject(ProductService)
  description!: string
  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '100%',
    minHeight: '100px',
    maxHeight: '800px',
    minWidth: '0',
    placeholder: 'Enter text here...',
    enableToolbar: true,
    showToolbar: true,
  };
  valueChange(value: string) {
    this.productService.descriptionSubject.next(value);
  }
  ngOnChanges() {
    if(this.value) {
      this.description = this.value
    }
  }
}
