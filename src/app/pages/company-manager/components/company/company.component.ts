import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Company } from '../../../../interfaces/company';
import { ActivatedRoute, Router } from '@angular/router';
import { DataSharingService } from '../../../../services/global-api/company-manager/data-sharing.service';
import { Subscription } from 'rxjs';

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

  constructor(private dataSharingService: DataSharingService) {}

  ngOnInit(): void {
    this.subscription = this.dataSharingService.companyData$.subscribe((data) => {
      this.company = data;
      if (!this.company) {
        console.warn('No company data found!');
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe(); 
  }
}
