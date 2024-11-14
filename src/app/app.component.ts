import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AlertsComponent } from "./components/alerts/alerts.component";
import { CdkTreeModule } from '@angular/cdk/tree';
import { NavbarComponent } from './components/common/navbar/navbar.component';
import { initFlowbite } from 'flowbite';
import { FooterComponent } from "./components/common/footer/footer.component";
@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    imports: [CommonModule, RouterOutlet, NavbarComponent, AlertsComponent, CdkTreeModule, FooterComponent]
})
export class AppComponent implements OnInit {
  title = 'Aluplast-Dashboard';
  ngOnInit(): void {
    initFlowbite();
  }
}
