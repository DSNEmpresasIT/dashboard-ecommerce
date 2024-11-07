import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../interfaces/product';
import { Subscription } from 'rxjs';
import { SupabaseService } from '../../services/supabase/supabase.service';
import { CardProductComponent } from "../../components/card-product/card-product.component";
import { FormProductComponent } from '../../components/form-product/form-product.component';
import { CategoryExploreComponent } from '../../components/category-explore/category-explore.component';
import { FormNewProductComponent } from "../../components/form-new-product/form-new-product.component";
import { ModalService } from '../../services/modal-new-product.service';
import { HttpClientModule } from '@angular/common/http';
import { FormSupplierComponent } from "../../components/form-supplier/form-supplier.component";
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { UserComponent } from "../company-manager/user/user.component";
import { ProductService } from '../../services/global-api/catalog/product.service';
@Component({
    selector: 'app-home',
    standalone: true,
    templateUrl: './home.component.html',
    styleUrl: './home.component.css',
    imports: []
})
export class HomeComponent {

}
