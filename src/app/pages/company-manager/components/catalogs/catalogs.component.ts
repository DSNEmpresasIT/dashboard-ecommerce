import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { Catalog } from '../../../../interfaces/product';
import { CatalogService } from '../../../../services/global-api/catalog/catalog.service';
import { CatalogFormComponent } from '../catalog-form/catalog-form.component';
import { CrudAction } from '../../../../enums/enums';
import { MatDialog } from '@angular/material/dialog';
import { AlertService } from '../../../../services/alert.service';
import { firstValueFrom, Subscription } from 'rxjs';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DataSharingService } from '../../../../services/global-api/company-manager/data-sharing.service';

@Component({
  selector: 'app-catalogs',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './catalogs.component.html',
  styleUrl: './catalogs.component.css'
})
export class CatalogsComponent implements OnInit, OnDestroy{
  catalogs: Catalog[] = [];
  private catalogService = inject(CatalogService)
  private alertService = inject(AlertService)
  readonly dialog = inject(MatDialog);
  action = CrudAction;
  
  private subscription!: Subscription;

  constructor(private dataSharingService: DataSharingService) {}

  ngOnInit(): void {
    this.subscription = this.dataSharingService.companyData$.subscribe((data) => {
      this.catalogs = data.catalogs;
      if (!this.catalogs) {
        console.warn('No catalogs data found!');
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe(); 
  }
 

  catalogCrud(action: CrudAction, catalog?:Catalog) {
    this.dialog.open(CatalogFormComponent, {
      width: "600px",
      data: { catalog , action }
    })
  }

  async deleteCatalog(catalog: Catalog) {
    try {
      await this.alertService.showConfirmation(async () => await firstValueFrom(this.catalogService.delete(catalog)))
    } catch (error) {
      console.log(error);
    }
  }

}
