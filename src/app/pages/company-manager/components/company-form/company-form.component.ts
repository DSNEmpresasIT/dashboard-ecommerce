import { Component, inject, Inject} from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { CompanyFormData } from '../../../../interfaces/data';
import { CatalogType, CrudAction } from '../../../../enums/enums';
import { MATERIAL_MODULES } from '../../../../../helpers/index-imports';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CompanyService } from '../../../../services/global-api/company-manager/company.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-company-form',
  standalone: true,
  imports: [MATERIAL_MODULES],
  templateUrl: './company-form.component.html',
  styleUrl: './company-form.component.css'
})
export class CompanyFormComponent {
  companyService = inject(CompanyService)
  crud = CrudAction
  title!: string
  errorMsg!: boolean
  catalogTypes = Object.values(CatalogType);
  catalogForm: FormGroup = new FormGroup({
      id: new FormControl(''),
      company_name: new FormControl('', Validators.required),
      cloudinary: new FormGroup({
        cloud_name: new FormControl(''),
        api_key: new FormControl(''),
        api_secret: new FormControl('')
      }),
      email_keys: new FormArray([this.createEmailGroup()]),
      contact_info: new FormGroup({
        email: new FormControl(''),
        phone: new FormControl(''),
        address: new FormControl(''),
        whatssap: new FormControl(''),
        schedule: new FormControl(''),
        opening_time: new FormControl(''),
        closing_time: new FormControl(''),
        embed_google_map: new FormControl('')
      }),
      links: new FormGroup({
        instagram_link: new FormControl(''),
        facebook_link: new FormControl(''),
        twitter_link: new FormControl(''),
        linktree_link: new FormControl('')
      })
  });
  constructor(@Inject(MAT_DIALOG_DATA) public data: CompanyFormData , private dialogRef: MatDialogRef<CompanyFormComponent>) {
    console.log(data, ' in company');
    this.catalogForm.patchValue({
        id:data.companyDTO?.id || undefined,
        company_name: data.companyDTO?.company_name || '',
        cloudinary: data.companyDTO?.keys?.cloudinary_keys || {},
        email_keys: data.companyDTO?.keys?.email_keys || {},
        contact_info: data.companyDTO?.keys?.contact_info || {},
        links: data.companyDTO?.keys?.links || {}
    });
    this.title = this.data.action
    if (data.action === CrudAction.READ) {
      this.catalogForm.disable()
    }
  }


  get email_keys(): FormArray {
    return this.catalogForm.get('email_keys') as FormArray;
  }

  createEmailGroup(): FormGroup {
    return new FormGroup({
      host: new FormControl('', Validators.required),
      user: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
      port: new FormControl(null, [Validators.required, Validators.pattern('^[0-9]+$')]),
      email: new FormControl('', [Validators.required, Validators.email])
    });
  }

  addEmail() {
    this.email_keys.push(this.createEmailGroup());
  }

  removeEmail(index: number) {
    this.email_keys.removeAt(index);
  }

  async submit() {
    // this.dialogRef.close()
    if(!this.catalogForm.valid) return
    try {
      switch (this.data.action) {
        case CrudAction.CREATE:
          // const response = await firstValueFrom(this.catalogService.create(this.catalogForm.value))
          // console.log(response)
          break;
  
        case CrudAction.READ:
          break;
  
        case CrudAction.DELETE:
          break;
  
        case CrudAction.UPDATE:
          const updateResponse = await firstValueFrom(this.companyService.update(this.catalogForm.value))
          console.log(updateResponse)
          break;
      }
    } catch (error) {
      console.error(error)
    }
  }
}
