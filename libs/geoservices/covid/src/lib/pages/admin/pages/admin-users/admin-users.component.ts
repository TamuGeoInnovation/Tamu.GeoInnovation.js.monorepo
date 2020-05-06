import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { UserWithStats } from '@tamu-gisc/covid/data-api';
import { UsersService } from '@tamu-gisc/geoservices/data-access';

@Component({
  selector: 'tamu-gisc-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss']
})
export class AdminUsersComponent implements OnInit {
  public users: Observable<Array<UserWithStats>>;

  constructor(private us: UsersService) {}

  public ngOnInit() {
    this.users = this.us.getUsersWithStats().pipe(shareReplay(1));
  }
}
