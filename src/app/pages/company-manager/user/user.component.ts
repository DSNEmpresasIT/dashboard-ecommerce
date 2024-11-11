import { Component } from '@angular/core';
import { Catalog } from '../../../interfaces/product';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/global-api/company-manager/user.service';
import { RouterModule } from '@angular/router';
import { CdkMenuModule } from '@angular/cdk/menu';
import { CompanyService } from '../../../services/global-api/company-manager/company.service';
import { Company } from '../../../interfaces/company';

export interface User {
  id:number,
  user_name:string,
  email:string,
  company:Company
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
  users: User[] = [];
  catalogs: Catalog[] = [];
  newCatalogName: string = '';
  company!: Company;
  constructor(private userService: UserService, private companyService: CompanyService) {}

  ngOnInit(): void {
    this.loadCompany()
    this.loadUsers();
    this.loadCatalogs();
  }

  loadUsers() {
    console.log('ejecutando')
    this.userService.getUsersByCompany().subscribe(
      (data) => this.users = data,
      (error) => console.error('Error loading users', error)
    );
  }

  loadCatalogs() {
    this.userService.getCatalogs(this.userService.payload?.user.companyId).subscribe(
      (data) => this.catalogs = data,
      (error) => console.error('Error loading catalogs', error)
    );
  }

  loadCompany() {
    this.companyService.getCompany().subscribe(
      (data) => this.company = data,
      (error) => console.error('Error loading company', error)
    )
  }

  removeUser(user: User) {
    this.userService.removeUser(user.user_name).subscribe(
      () => this.users = this.users.filter(u => u !== user),
      (error) => console.error('Error removing user', error)
    );
  }

  removeCatalog(catalog: Catalog) {
    this.userService.removeCatalog(catalog.name).subscribe(
      () => this.catalogs = this.catalogs.filter(c => c !== catalog),
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
          this.catalogs.push(data);
          this.newCatalogName = '';
        },
        (error) => console.error('Error adding catalog', error)
      );
    }
  }
}
