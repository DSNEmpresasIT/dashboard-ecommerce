import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import {
  MatDialogModule,
} from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { ModalButtonComponent } from '../app/components/modal-button/modal-button.component';


export const MATERIAL_MODULES = [
  MatButtonModule,
  MatDialogModule,
  MatButtonToggleModule,
  ReactiveFormsModule,
  ModalButtonComponent,
  MatFormFieldModule,
  MatSelectModule,
]