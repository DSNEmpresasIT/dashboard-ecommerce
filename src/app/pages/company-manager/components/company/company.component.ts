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
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-company',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './company.component.html',
  styleUrl: './company.component.css'
})
export class CompanyComponent implements OnInit, OnDestroy{
  company: any;
  visibleFields: { [key: string]: boolean } = {};
  private subscription!: Subscription;
  readonly dialog = inject(MatDialog);
  action = CrudAction;
  constructor(
    private dataSharingService: DataSharingService,
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

  toggleVisibility(index: number, field: string): void {
    const key = `${index}-${field}`;
    this.visibleFields[key] = !this.visibleFields[key];
  }

  isVisible(index: number, field: string): boolean {
    return !!this.visibleFields[`${index}-${field}`];
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
