import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { User } from '@tamu-gisc/oidc/common';
import { UsersService } from '@tamu-gisc/oidc/admin/data-access';

@Component({
  selector: 'edit-users',
  templateUrl: './edit-users.component.html',
  styleUrls: ['./edit-users.component.scss']
})
export class EditUsersComponent implements OnInit {
  public $users: Observable<Array<Partial<User>>>;

  constructor(private readonly userService: UsersService) {}

  public ngOnInit(): void {
    this.fetchUsers();
  }

  public deleteUser(user: User) {
    console.log('deleteUser', user);
    this.userService.deleteUser(user).subscribe((deleteStatus) => {
      console.log('Deleted ', user.guid);
      this.fetchUsers();
    });
  }

  public fetchUsers() {
    this.$users = this.userService.getUsers().pipe(shareReplay(1));
  }
}
