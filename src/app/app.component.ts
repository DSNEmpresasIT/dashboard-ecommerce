import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./components/navbar/navbar.component";
import { initFlowbite } from 'flowbite';
import { AlertsComponent } from "./components/alerts/alerts.component";

@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    imports: [CommonModule, RouterOutlet, NavbarComponent, AlertsComponent]
})
export class AppComponent implements OnInit {
  title = 'admDashBoardFelix';

  ngOnInit(): void {
    initFlowbite();
  }
}
