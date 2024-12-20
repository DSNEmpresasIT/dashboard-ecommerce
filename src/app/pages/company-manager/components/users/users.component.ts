import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { User } from '../../user/user.component';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { DataSharingService } from '../../../../services/global-api/company-manager/data-sharing.service';
import { firstValueFrom, Subscription } from 'rxjs';
import { UserService } from '../../../../services/global-api/company-manager/user.service';
import { Company } from '../../../../interfaces/company';
import { CrudAction } from '../../../../enums/enums';
import { UserFormComponent } from '../user-form/user-form.component';
import { AlertService, AlertsType } from '../../../../services/alert.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit, OnDestroy{
  users: User[] = [];
  readonly dialog = inject(MatDialog);
  private subscription!: Subscription;
  private alertService = inject(AlertService)
  private userService = inject(UserService)

  action = CrudAction

  constructor(private dataSharingService: DataSharingService) {}

  ngOnInit(): void {
    this.subscription = this.dataSharingService.companyData$.subscribe((data) => {
      this.users = data.users;
      if (!this.users) {
        console.warn('No users data found!');
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe(); 
  }

  userCrud(user: User | null, company: Company | null, action: CrudAction) {
    this.dialog.open(UserFormComponent, {
      width: "600px",
      data: { user,refresh: () => this.dataSharingService.refreshCompanyData(), action, company }
    })
  }

  async deleteUser(id: any) {
    try {
      await this.alertService.showConfirmation(async () => await firstValueFrom(this.userService.removeUser(id)))
      // this.dataSharingService.refreshCompanyData()
    } catch (error) {
      this.alertService.show(4000, "Se produjo un error al intentar eliminar el usuario", AlertsType.ERROR);
    }
  }
}
