import { Component, OnInit } from '@angular/core';
import { UsersService } from '@tamu-gisc/oidc/admin-data-access';
import { Observable } from 'rxjs';
import { User } from '@tamu-gisc/oidc/provider-nest';

@Component({
  selector: 'users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  public $users: Observable<Array<Partial<User>>>;
  constructor(private readonly userService: UsersService) {
    this.$users = this.userService.getUsersAll();
  }

  ngOnInit(): void {}
}
