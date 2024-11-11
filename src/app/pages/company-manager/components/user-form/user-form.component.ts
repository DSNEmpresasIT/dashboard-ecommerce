import { Component, inject, Inject, Input } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
  MatDialogModule,
  MAT_DIALOG_DATA,
  MatDialogRef
} from '@angular/material/dialog';
import { Data } from '../../../../interfaces/data';
import { ModalButtonComponent } from "../../../../components/modal-button/modal-button.component";
import { CrudAction } from '../../../../enums/enums';
import { UserService } from '../../../../services/global-api/company-manager/user.service';
import { firstValueFrom } from 'rxjs';
@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatButtonModule, MatDialogModule, MatButtonToggleModule, ReactiveFormsModule, ModalButtonComponent],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.css'
})
export class UserFormComponent {
  userService = inject(UserService)
  crud = CrudAction
  title!: string
  errorMsg!: boolean
  userForm: FormGroup = new FormGroup({
    id: new FormControl(''),
    email: new FormControl('', [Validators.required, Validators.email]),
    userName: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.minLength(10)])
  });
  constructor(@Inject(MAT_DIALOG_DATA) public data: Data, private dialogRef: MatDialogRef<UserFormComponent>) {
    console.log(data);
    this.userForm.patchValue({
      id: data.user?.id,
      email: data?.user?.email,
      userName: data?.user?.user_name
    })
    this.title = this.data.action
    if (data.action === CrudAction.READ) {
      this.userForm.disable()
    }
  }
  async submit() {
    // this.dialogRef.close()
    if(!this.userForm.valid) return
    try {
      switch (this.data.action) {
        case CrudAction.CREATE:
          
          break;
  
        case CrudAction.READ:
          break;
  
        case CrudAction.DELETE:
          break;
  
        case CrudAction.UPDATE:
            const response = await firstValueFrom(this.userService.updateUser(this.userForm.get('id')?.value, this.userForm.value))
            console.log(response);
          break;
      }
    } catch (error) {
      console.error(error)
    }
  }
}
