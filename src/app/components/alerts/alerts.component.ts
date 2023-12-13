import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertService, AlertsType } from '../../services/alert.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alerts.component.html',
})
export class AlertsComponent {
  AlertsType = AlertsType;
  showAlert = false;
  alertType!: AlertsType;
  alertMessage!: string;
  private showAlertSubscription: Subscription;

  constructor(private alertService: AlertService) {
    this.showAlertSubscription = this.alertService.showAlert$.subscribe((data) => {
      this.showAlert = true;
      this.alertType = data.type;
      this.alertMessage = data.message;

      setTimeout(() => {
        this.hideAlert();
      }, data.duration);
    });
  }

  hideAlert() {
    this.showAlert = false;
  }

  ngOnDestroy() {
    this.showAlertSubscription.unsubscribe();
  }
}
