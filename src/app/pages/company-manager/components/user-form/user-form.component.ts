import { Component, inject, Inject, Input } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import {
  MatDialogModule,
  MAT_DIALOG_DATA,
  MatDialogRef
} from '@angular/material/dialog';
import { Data } from '../../../../interfaces/data';
import { ModalButtonComponent } from "../../../../components/modal-button/modal-button.component";
import { CrudAction, Roles } from '../../../../enums/enums';
import { UserService } from '../../../../services/global-api/company-manager/user.service';
import { firstValueFrom } from 'rxjs';
import { AlertService, AlertsType } from '../../../../services/alert.service';
import { ReplaceUnderscorePipe } from '../../../../pipes/replace-underscore.pipe';
@Component({
  selector: 'app-user-form',
  standalone: true,
  providers: [],
  imports: [MatButtonModule, MatDialogModule, MatButtonToggleModule, ReactiveFormsModule, ModalButtonComponent, ReplaceUnderscorePipe],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.css'
})
export class UserFormComponent {
  roles = Object.keys(Roles).map((key) => ({
    key: key,
    rol: Roles[key as keyof typeof Roles]
  }));
  userService = inject(UserService)
  alertService = inject(AlertService)
  crud = CrudAction
  title!: string
  userForm: FormGroup = new FormGroup({
    id: new FormControl(''),
    companyId: new FormControl(''),
    email: new FormControl('', [Validators.required, Validators.email]),
    userName: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.minLength(4)]),
    role: new FormControl(""),
  });
  constructor(@Inject(MAT_DIALOG_DATA) public data: Data, private dialogRef: MatDialogRef<UserFormComponent>) {
    this.userForm.patchValue({
      id: data.user?.id || '',
      email: data?.user?.email || '',
      userName: data?.user?.user_name || ''
    })
    this.title = this.data.action
    if (data.action === CrudAction.CREATE) {
      this.userForm.get('companyId')?.setValue(data.company?.id)
      
      this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(4)]);
      this.userForm.get('password')?.updateValueAndValidity();
    }
    if (data.action === CrudAction.READ) {
      this.userForm.disable()
    }
  }
  async submit() {
    console.log(this.userForm.value);
    if (!this.userForm.valid) return
    try {
      switch (this.data.action) {
        case CrudAction.CREATE:
          await firstValueFrom(this.userService.addUser(this.userForm.get('companyId')?.value, this.userForm.value))
          await this.data.refresh()
          this.dialogRef.close()
          break;
        case CrudAction.UPDATE:
          await firstValueFrom(this.userService.updateUser(this.userForm.get('id')?.value, this.userForm.value))
          await this.data.refresh()
          this.dialogRef.close()
          break;
      }
    } catch (error) {
      console.error(error)
      this.alertService.show(4000, "Se produjo un error al intentar actualizar la información del usuario", AlertsType.ERROR);
    }
  }
}
