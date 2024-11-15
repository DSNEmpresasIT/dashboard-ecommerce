import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { User } from '../../user/user.component';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { DataSharingService } from '../../../../services/global-api/company-manager/data-sharing.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit, OnDestroy{
  users: User[] = [];
  readonly dialog = inject(MatDialog);
  private subscription!: Subscription;

  constructor(private dataSharingService: DataSharingService) {}

  ngOnInit(): void {
    this.subscription = this.dataSharingService.companyData$.subscribe((data) => {
      this.users = data.users;
      if (!this.users) {
        console.warn('No users data found!');
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe(); 
  }
}
