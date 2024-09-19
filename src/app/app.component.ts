import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./components/navbar/navbar.component";
import { AlertsComponent } from "./components/alerts/alerts.component";
import { CdkTreeModule } from '@angular/cdk/tree';

@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    imports: [CommonModule, RouterOutlet, NavbarComponent, AlertsComponent, CdkTreeModule]
})
export class AppComponent  {
  title = 'Aluplast-Dashboard';
  
}
