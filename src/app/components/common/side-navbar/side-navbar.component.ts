import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {MatSidenavModule} from '@angular/material/sidenav';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { CUSTOMPATHS } from '../../../enums/routes';

export interface NavbarLink {
  label: string;
  path: string;
  samePage?: boolean;
}

@Component({
  selector: 'app-side-navbar',
  standalone: true,
  imports: [MatButtonModule, MatSidenavModule, RouterLink, CommonModule, RouterLinkActive],
  templateUrl: './side-navbar.component.html',
  styleUrl: './side-navbar.component.css'
})
export class SideNavbarComponent {
  @Input() links: NavbarLink[] = [];
  showFiller = false;
  custompath = CUSTOMPATHS;
  constructor(public authServ: AuthService,){}

  scrollTo(elementId: string): void {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  logout(){
    this.authServ.logout()
  }

}
