import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { Company } from '../../../../interfaces/company';
import { ActivatedRoute, Router } from '@angular/router';
import { DataSharingService } from '../../../../services/global-api/company-manager/data-sharing.service';
import { firstValueFrom, Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { CrudAction } from '../../../../enums/enums';
import { CompanyFormComponent } from '../company-form/company-form.component';
import { CompanyService } from '../../../../services/global-api/company-manager/company.service';
import { AlertService, AlertsType } from '../../../../services/alert.service';

@Component({
  selector: 'app-company',
  standalone: true,
  imports: [],
  templateUrl: './company.component.html',
  styleUrl: './company.component.css'
})
export class CompanyComponent implements OnInit, OnDestroy{
  company: any;
  private subscription!: Subscription;
  readonly dialog = inject(MatDialog);
  action = CrudAction;
  constructor(
    private dataSharingService: DataSharingService,
    private companyService: CompanyService,
    private alertService: AlertService
  ) {}

  async ngOnInit() {

        this.subscription = this.dataSharingService.companyData$.subscribe((data) => {
          this.company = data;
          if (!this.company) {
            console.warn('No company data found!');

          }

    });
 
  }

  copyToClipboard(value: string | undefined): void {
    if (!value) {
      alert('Dato no disponible para copiar');
      return;
    }
    navigator.clipboard.writeText(value).then(() => {
      this.alertService.show(3000,'Copiado al portapapeles',AlertsType.SUCCESS)
    });
  }

  companyCrud(action: CrudAction, companyDTO?:Company) {
    console.log(companyDTO, 'company to send')
    this.dialog.open(CompanyFormComponent, {
      width: "600px",
      minHeight: "750px",
      data: { companyDTO , action }
    })
  }



  ngOnDestroy(): void {
    this.subscription.unsubscribe(); 
  }
}
