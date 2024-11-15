import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {  RouterModule } from '@angular/router';
import { CdkMenuModule } from '@angular/cdk/menu';
import { CompanyService } from '../../../services/global-api/company-manager/company.service';
import { Company } from '../../../interfaces/company';
import {  Roles } from '../../../enums/enums';
import { NavbarLink, SideNavbarComponent } from "../../../components/common/side-navbar/side-navbar.component";
import { DataSharingService } from '../../../services/global-api/company-manager/data-sharing.service';

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
  imports: [CommonModule, RouterModule, CdkMenuModule, SideNavbarComponent],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent {
  company!: Company;

  constructor( 
     private companyService: CompanyService,
     private dataSharingService: DataSharingService
    ) {}

  ngOnInit(): void {
    this.loadCompany()
  }

  loadCompany() {
    this.companyService.getCompany().subscribe(
      (data) => {
        this.dataSharingService.setCompanyData(data);
        console.log(data, 'data')
      },
      (error) => console.error('Error loading data', error)
    );
  }

  navLinks: NavbarLink[] = [
    { label: 'Home', path: '/home' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
    { label: 'Section', path: '#section', samePage: true }
  ];

}
