import { Component, Input } from '@angular/core';
import { CrudAction } from '../../enums/enums';
import { MatDialogClose } from '@angular/material/dialog';

@Component({
  selector: 'app-modal-button',
  standalone: true,
  imports: [MatDialogClose],
  templateUrl: './modal-button.component.html'
})
export class ModalButtonComponent {
  @Input() action!: CrudAction
  crud = CrudAction
}
