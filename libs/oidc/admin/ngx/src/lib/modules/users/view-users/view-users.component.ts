import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { User } from '@tamu-gisc/oidc/common';
import { UsersService } from '@tamu-gisc/oidc/admin/data-access';

@Component({
  selector: 'tamu-gisc-view-users',
  templateUrl: './view-users.component.html',
  styleUrls: ['./view-users.component.scss']
})
export class ViewUsersComponent implements OnInit {
  public $users: Observable<Array<Partial<User>>>;

  constructor(private readonly userService: UsersService) {}

  public ngOnInit(): void {
    this.fetchUsers();
  }

  public fetchUsers() {
    this.$users = this.userService.getUsers().pipe(shareReplay(1));
  }
}
