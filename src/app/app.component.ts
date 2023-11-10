import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./components/navbar/navbar.component";
import { initFlowbite } from 'flowbite';

@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    imports: [CommonModule, RouterOutlet, NavbarComponent]
})
export class AppComponent implements OnInit {
  title = 'admDashBoardFelix';

  ngOnInit(): void {
    initFlowbite();
  }
}
