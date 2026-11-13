import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { combineLatest, map, Observable, shareReplay, startWith } from 'rxjs';

import { UserService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { matchesText } from '@tamu-gisc/gisday/platform/ngx/common';
import { Auth0UserProfile } from '@tamu-gisc/common/nest/auth';
import { AsyncPipe } from '@angular/common';

import { AdminSearchComponent } from '../../../base-admin-list/admin-search.component';

/** The search (#2914) looks in the columns the page shows: name, email and connection id. */
export function matchesUser(user: Auth0UserProfile, search: string): boolean {
  return matchesText([user?.user_info?.name, user?.user_info?.email, user?.user_info?.id], search);
}

@Component({
  selector: 'tamu-gisc-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [AsyncPipe, AdminSearchComponent]
})
export class UserListComponent implements OnInit {
  private readonly us = inject(UserService);

  /** Users are not a season's, so this page searches its own list rather than BaseAdminListComponent's. */
  public readonly search = new FormControl('', { nonNullable: true });
  public users$: Observable<Array<Auth0UserProfile>>;
  public searchCounts$: Observable<{ shown: number; total: number }>;

  public ngOnInit(): void {
    const searched$ = combineLatest([this.us.getUsers(), this.search.valueChanges.pipe(startWith(this.search.value))]).pipe(
      map(([all, search]) => ({ all, shown: (all ?? []).filter((user) => matchesUser(user, search)) })),
      shareReplay(1)
    );

    this.users$ = searched$.pipe(map(({ shown }) => shown));
    this.searchCounts$ = searched$.pipe(map(({ all, shown }) => ({ shown: shown.length, total: all?.length ?? 0 })));
  }
}
