import { Component, OnInit } from '@angular/core';
import { UsersService } from '@tamu-gisc/oidc/admin-data-access';
import { Observable } from 'rxjs';
import { User } from '@tamu-gisc/oidc/provider-nestjs';
import { shareReplay } from 'rxjs/operators';

@Component({
  selector: 'view-users',
  templateUrl: './view-users.component.html',
  styleUrls: ['./view-users.component.scss']
})
export class ViewUsersComponent implements OnInit {
  public $users: Observable<Array<Partial<User>>>;

  constructor(private readonly userService: UsersService) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  public fetchUsers() {
    this.$users = this.userService.getUsers().pipe(shareReplay(1));
  }
}
