import { Component, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CompanyService } from '../../../services/global-api/company-manager/company.service';
import { Company } from '../../../interfaces/company';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {
  private companyService = inject(CompanyService)
  companies!: Company[]
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
}
