import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';

import { UserService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { Auth0UserProfile } from '@tamu-gisc/common/nest/auth';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'tamu-gisc-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [AsyncPipe]
})
export class UserListComponent implements OnInit {
  public users$: Observable<Array<Auth0UserProfile>>;

  constructor(private readonly us: UserService) {}

  public ngOnInit(): void {
    this.users$ = this.us.getUsers().pipe(shareReplay());
  }
}
