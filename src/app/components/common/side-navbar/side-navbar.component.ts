import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {MatSidenavModule} from '@angular/material/sidenav';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { CUSTOMPATHS } from '../../../enums/routes';
import { RoleService } from '../../../services/auth/role.service';
import { Roles } from '../../../enums/enums';

export interface NavbarLink {
  label: string;
  path: string;
  samePage?: boolean;
}

@Component({
  selector: 'app-side-navbar',
  standalone: true,
  imports: [MatButtonModule, MatSidenavModule, RouterLink, CommonModule, RouterModule],
  templateUrl: './side-navbar.component.html',
  styleUrl: './side-navbar.component.css'
})
export class SideNavbarComponent {
  @Input() links: NavbarLink[] = [];
  showFiller = false;
  custompath = CUSTOMPATHS;
  roleType = Roles
  constructor(public authServ: AuthService, public roleServ: RoleService){}

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
