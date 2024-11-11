import { Component, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CompanyService } from '../../../services/global-api/company-manager/company.service';
import { Company } from '../../../interfaces/company';
import { AlertService } from '../../../services/alert.service';
import { UserService } from '../../../services/global-api/company-manager/user.service';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import { CdkMenuModule } from '@angular/cdk/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UserFormComponent } from '../components/user-form/user-form.component';
import { User } from '../user/user.component';
import { CrudAction } from '../../../enums/enums';
@Component({
  selector: 'app-admin',
  standalone: true,
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
  imports: [MatButtonModule, MatMenuModule, MatIconModule, CdkMenuModule, MatDialogModule]
})
export class AdminComponent {
  private companyService = inject(CompanyService)
  private alertService = inject(AlertService)
  private userService = inject(UserService)
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
    } catch (error) {

    }
  }
  userCrud(user: User, action: CrudAction) {
    this.dialog.open(UserFormComponent, {
      width: "600px",
      data: { user, action }
    })
  }
  async deleteUser(id: any) {
    try {
      await this.alertService.showDeleteConfirmation(async () => await firstValueFrom(this.userService.removeUser(id)))
    } catch (error) {
      console.log(error);
    }
  }
  async deleteCompany(id: any) {
    try {
      await this.alertService.showDeleteConfirmation(async () => await firstValueFrom(this.userService.removeUser(id)))
    } catch (error) {
      console.log(error);
    }
  }
}
