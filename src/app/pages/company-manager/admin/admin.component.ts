import { Component, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CompanyService } from '../../../services/global-api/company-manager/company.service';
import { Company } from '../../../interfaces/company';
import { AlertService, AlertsType } from '../../../services/alert.service';
import { UserService } from '../../../services/global-api/company-manager/user.service';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { CdkMenuModule } from '@angular/cdk/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UserFormComponent } from '../components/user-form/user-form.component';
import { User } from '../user/user.component';
import { CrudAction } from '../../../enums/enums';
import { CommonModule } from '@angular/common';
import { SideNavbarComponent } from "../../../components/common/side-navbar/side-navbar.component";
import { Catalog } from '../../../interfaces/product';
import { CatalogFormComponent } from '../components/catalog-form/catalog-form.component';
import { CatalogService } from '../../../services/global-api/catalog/catalog.service';
import { CompanyFormComponent } from '../components/company-form/company-form.component';
@Component({
  selector: 'app-admin',
  standalone: true,
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
  imports: [MatButtonModule, MatMenuModule, MatIconModule, CdkMenuModule, MatDialogModule, CommonModule, SideNavbarComponent]
})
export class AdminComponent {
  private companyService = inject(CompanyService)
  private alertService = inject(AlertService)
  private userService = inject(UserService)
  private catalogService = inject(CatalogService)
  readonly dialog = inject(MatDialog);
  companies!: Company[]
  action = CrudAction
  async ngOnInit() {
    await this.getCompanies()
  }
  async getCompanies() {
    try {
      const response = await firstValueFrom(this.companyService.getCompanies())
      this.companies = response
      const companies = this.companies.map((company) => {
        const newCompany = company
        return { ...newCompany, activeTab: "users" }
      })
      this.companies = companies
    } catch (error) {
      this.alertService.show(4000, "Se produjo un error al obtener la información", AlertsType.ERROR);
    }
  }
  userCrud(user: User | null, company: Company | null, action: CrudAction) {
    this.dialog.open(UserFormComponent, {
      width: "600px",
      data: { user, action, refresh: () => this.getCompanies(), company }
    })
  }
  catalogCrud(action: CrudAction, catalog?:Catalog) {
    this.dialog.open(CatalogFormComponent, {
      width: "600px",
      data: { catalog , action, refresh: () => this.getCompanies() }
    })
  }
  companyCrud(action: CrudAction, company?: Company) {
    this.dialog.open(CompanyFormComponent, {
      width: "600px",
      data: { companyDTO: company , action, refresh: () => this.getCompanies() }
    })
  }
  async deleteCatalog(catalog: Catalog) {
    try {
      await this.alertService.showConfirmation(async () => await firstValueFrom(this.catalogService.delete(catalog)))
    } catch (error) {
      this.alertService.show(4000, "Se produjo un error al intentar eliminar el catálogo", AlertsType.ERROR);
    }
  }
  async deleteUser(id: any) {
    try {
      await this.alertService.showConfirmation(async () => await firstValueFrom(this.userService.removeUser(id)))
      await this.getCompanies()
    } catch (error) {
      this.alertService.show(4000, "Se produjo un error al intentar eliminar el usuario", AlertsType.ERROR);
    }
  }
  async deleteCompany(id: any) {
    try {
      await this.alertService.showConfirmation(async () => await firstValueFrom(this.userService.removeUser(id)))
    } catch (error) {
      this.alertService.show(4000, "Se produjo un error al intentar eliminar la empresa", AlertsType.ERROR);
    }
  }
  showTab(tab: string, companyIndex: number) {
    this.companies[companyIndex].activeTab = tab;
  }
}
