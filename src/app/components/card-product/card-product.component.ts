import { Component, EventEmitter, Input, OnInit, Output, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../interfaces/product';
import { DeletCheckComponent } from "../delet-check/delet-check.component";
import { ProductService } from '../../services/global-api/product.service';
import { DeletTypes } from '../../enums/enums';
import { deleteConfig } from '../../interfaces/interfaces';
import { RouterModule } from '@angular/router';
import { ModalService } from '../../services/modal-new-product.service';

@Component({
  selector: 'app-card-product',
  standalone: true,
  templateUrl: './card-product.component.html',
  styleUrls: ['./card-product.component.css'],
  imports: [CommonModule, DeletCheckComponent, RouterModule]
})
export class CardProductComponent implements OnInit, OnChanges {
  @Input() renderProduct!: Product;
  @Output() booleanOutput: EventEmitter<boolean> = new EventEmitter<boolean>();

  toggleForm: boolean = false;
  deleteConfig: deleteConfig = {
    id: 0,
    itemName: '',
    toDelete: DeletTypes.PRODUCT,
    title: '¿Está seguro de que desea eliminar este producto?',
    text: 'Escriba el nombre del producto para confirmar:'
  };

  @ViewChild(DeletCheckComponent) deletCheckComponent!: DeletCheckComponent;

  constructor(private productServ: ProductService,
    private modalProduct: ModalService
  ) {}

  ngOnInit() {}

  editProduct(id:number){
    this.modalProduct.toggleModal(true,id)
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['renderProduct'] && this.renderProduct && this.renderProduct.name) {
      this.deleteConfig.id = this.renderProduct.id;
      this.deleteConfig.itemName = this.renderProduct.name;
    }
  }

  getProducts() {
    this.productServ.fetchAllProducts().then(() => {
      console.log('Productos obtenidos');
    });
  }

  resetSelect() {
    this.deleteConfig.itemName = '';
  }

  handleGetCategories() {
    setTimeout(() => {
      this.getProducts();
      this.resetSelect();
    }, 1000);
  }

  getProductId(id: number) {
    this.booleanOutput.emit();
  }
}

