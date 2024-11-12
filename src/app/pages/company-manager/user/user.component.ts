import { Component, inject } from '@angular/core';
import { Catalog } from '../../../interfaces/product';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/global-api/company-manager/user.service';
import { RouterModule } from '@angular/router';
import { CdkMenuModule } from '@angular/cdk/menu';
import { CompanyService } from '../../../services/global-api/company-manager/company.service';
import { Company } from '../../../interfaces/company';
import { MatDialog } from '@angular/material/dialog';
import { CatalogFormComponent } from '../components/catalog-form/catalog-form.component';
import { CrudAction, Roles } from '../../../enums/enums';
import { AlertService } from '../../../services/alert.service';
import { firstValueFrom } from 'rxjs';
import { CatalogService } from '../../../services/global-api/catalog/catalog.service';

export interface User {
  id:number,
  user_name:string,
  email:string,
  company:Company
  role: role
}
export interface role {
  name:string,
  key:Roles
}
@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule,RouterModule, CdkMenuModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent {
  editUser(_t14: User) {
  throw new Error('Method not implemented.');
  }
  private alertService = inject(AlertService)
  private catalogService = inject(CatalogService)
  newCatalogName: string = '';
  company!: Company;
  action = CrudAction;
  constructor(private userService: UserService, private companyService: CompanyService) {}

  readonly dialog = inject(MatDialog);

  catalogCrud(action: CrudAction, catalog?:Catalog) {
    this.dialog.open(CatalogFormComponent, {
      width: "600px",
      data: { catalog , action }
    })
  }
  ngOnInit(): void {
    this.loadCompany()

  }

  loadCompany() {
    this.companyService.getCompany().subscribe(
      (data) => {this.company = data, console.log(data)},
      (error) => console.error('Error loading company', error)
    )
  }

  removeUser(user: User) {
    this.userService.removeUser(user.user_name).subscribe(
      () => this.company.users = this.company.users?.filter(u => u !== user),
      (error) => console.error('Error removing user', error)
    );
  }

  async deleteCatalog(catalog: Catalog) {
    try {
      await this.alertService.showDeleteConfirmation(async () => await firstValueFrom(this.catalogService.delete(catalog)))
    } catch (error) {
      console.log(error);
    }
  }

  removeCatalog(catalog: Catalog) {
    this.userService.removeCatalog(catalog.name).subscribe(
      () => this.company.catalogs = this.company.catalogs?.filter(c => c !== catalog),
      (error) => console.error('Error removing catalog', error)
    );
  }

  addCatalog() {
    if (this.newCatalogName.trim()) {
      const newCatalog: Catalog = {
        name: this.newCatalogName,
        id: 0,
        created_at: new Date(),
        is_active: false
      };
      this.userService.addCatalog(newCatalog).subscribe(
        (data) => {
          this.company.catalogs?.push(data);
          this.newCatalogName = '';
        },
        (error) => console.error('Error adding catalog', error)
      );
    }
  }
}
