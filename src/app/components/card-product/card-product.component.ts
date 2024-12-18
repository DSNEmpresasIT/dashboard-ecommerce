import { Component, EventEmitter, Input, OnInit, Output, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../interfaces/product';
import { DeletCheckComponent } from "../delet-check/delet-check.component";

import { DeletTypes } from '../../enums/enums';
import { deleteConfig } from '../../interfaces/interfaces';
import { RouterModule } from '@angular/router';
import { ModalService } from '../../services/modal-new-product.service';
import { CdkMenuModule } from '@angular/cdk/menu';
import { ProductPreviewComponent } from "../product-preview/product-preview.component";
import { ProductService } from '../../services/global-api/catalog/product.service';
import { CatalogStateService } from '../../services/global-api/catalog/catalog-state.service';

@Component({
  selector: 'app-card-product',
  standalone: true,
  templateUrl: './card-product.component.html',
  styleUrls: ['./card-product.component.css'],
  imports: [CommonModule, DeletCheckComponent, RouterModule, CdkMenuModule, ProductPreviewComponent]
})
export class CardProductComponent implements OnInit, OnChanges {
  @Input() renderProduct!: Product;
  @Output() booleanOutput: EventEmitter<boolean> = new EventEmitter<boolean>();
  catalogId: string | null = null
  
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
    private modalProduct: ModalService,
    private catalogState: CatalogStateService
  ) {
    this.catalogState.catalogId$.subscribe(id => {
      this.catalogId = id;
    });
  }


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

  deleteProduct(product: Product) {
    const name = product.name
    if(product && name){
      this.deleteConfig.itemName = name;
      this.deleteConfig.id = product.id;
      this.deletCheckComponent.openDialog()
    }
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

