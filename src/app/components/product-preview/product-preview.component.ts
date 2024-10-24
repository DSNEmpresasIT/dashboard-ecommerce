import { Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'app-product-preview',
  standalone: true,
  imports: [],
  templateUrl: './product-preview.component.html'
})
export class ProductPreviewComponent {
  @Input() renderProduct: any;
  @ViewChild('imageDialog') imageDialog!: ElementRef;

  currentImageIndex: number = 0;
  imageHoverInterval: any;

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.imageDialog.nativeElement.open) {
      if (event.key === 'ArrowRight') {
        this.nextImage();
      } else if (event.key === 'ArrowLeft') {
        this.prevImage();
      }
    }
  }

  startImageHover() {
    if (this.renderProduct.images.length > 1) {
      this.imageHoverInterval = setInterval(() => {
        this.currentImageIndex = (this.currentImageIndex + 1) % this.renderProduct.images.length;
      }, 1000); 
    }
  }

  stopImageHover() {
    clearInterval(this.imageHoverInterval);
    this.currentImageIndex = 0;
  }

  openDialog() {
    this.imageDialog.nativeElement.showModal();
  }

  closeDialog(e: Event) {
    if (e && e.target === e.currentTarget) {
      this.imageDialog.nativeElement.close();
    }
  }

  prevImage() {
    if (this.renderProduct.images.length > 0) {
      this.currentImageIndex = (this.currentImageIndex - 1 + this.renderProduct.images.length) % this.renderProduct.images.length;
    }
  }

  nextImage() {
    if (this.renderProduct.images.length > 0) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.renderProduct.images.length;
    }
  }
}
