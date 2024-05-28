import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.css'
})
export class DropdownComponent {
  @Input() options: { label: string, action: () => void }[] = [];
  isOpen = false;

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  onOptionClick(action: () => void) {
    action();
    this.isOpen = false;
  }
}
