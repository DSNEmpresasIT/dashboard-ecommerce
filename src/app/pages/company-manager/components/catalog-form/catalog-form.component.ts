import { Component, inject, Inject} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CatalogFormData } from '../../../../interfaces/data';
import { CatalogType, CrudAction } from '../../../../enums/enums';
import { firstValueFrom } from 'rxjs';
import { MATERIAL_MODULES } from '../../../../../helpers/index-imports';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CatalogService } from '../../../../services/global-api/catalog/catalog.service';



@Component({
  selector: 'app-catalog-form',
  standalone: true,
  imports: [MATERIAL_MODULES],
  templateUrl: './catalog-form.component.html',
  styleUrl: './catalog-form.component.css'
})
export class CatalogFormComponent {
  catalogService = inject(CatalogService)
  crud = CrudAction
  title!: string
  errorMsg!: boolean
  catalogTypes = Object.values(CatalogType);
  catalogForm: FormGroup = new FormGroup({
    id: new FormControl(''),
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    catalogType: new FormControl('', [Validators.required])
  });
  constructor(@Inject(MAT_DIALOG_DATA) public data: CatalogFormData, private dialogRef: MatDialogRef<CatalogFormComponent>) {
    console.log(data);
    this.catalogForm.patchValue({
      id: data.catalog?.id,
      name: data?.catalog?.name,
      catalogType: data?.catalog?.catalogType
    })
    this.title = this.data.action
    if (data.action === CrudAction.READ) {
      this.catalogForm.disable()
    }
  }
  async submit() {
    if(!this.catalogForm.valid) return
    try {
      switch (this.data.action) {
        case CrudAction.CREATE:
          await firstValueFrom(this.catalogService.create(this.catalogForm.value))
          this.dialogRef.close()
          break;
        case CrudAction.READ:
          break;
        case CrudAction.DELETE:
          break;
        case CrudAction.UPDATE:
          await firstValueFrom(this.catalogService.update(this.catalogForm.value))
          this.dialogRef.close()
          break;
      }
    } catch (error) {
      console.error(error)
    }
  }
}
