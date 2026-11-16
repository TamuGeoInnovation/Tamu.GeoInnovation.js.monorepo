import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormControl } from '@angular/forms';
import { Observable, debounceTime, distinctUntilChanged, map, shareReplay, startWith, switchMap } from 'rxjs';

import { UserService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { Auth0UserList } from '@tamu-gisc/common/nest/auth';

import { AdminSearchComponent } from '../../../base-admin-list/admin-search.component';

@Component({
  selector: 'tamu-gisc-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [AsyncPipe, AdminSearchComponent]
})
export class UserListComponent implements OnInit {
  private readonly us = inject(UserService);

  /**
   * The search, in the shared admin search box (#2914). Users are not a season's, so this page searches its own list,
   * and it asks the API, which searches every Auth0 user, not only the first 1,000 the list can hold (#2574).
   */
  public readonly search = new FormControl('', { nonNullable: true });

  /** The users the API gives, and whether the list was cut off at Auth0's 1,000; null while they load. */
  public users$: Observable<Auth0UserList | null>;
  /** How many are listed, for the search box. */
  public counts$: Observable<{ shown: number; total: number } | null>;

  public ngOnInit(): void {
    this.users$ = this.search.valueChanges.pipe(
      debounceTime(400),
      startWith(this.search.value),
      map((q) => q.trim()),
      distinctUntilChanged(),
      switchMap((q) => this.us.getUsers(q || undefined).pipe(startWith(null))),
      shareReplay(1)
    );
    this.counts$ = this.users$.pipe(map((list) => (list ? { shown: list.users.length, total: list.users.length } : null)));
  }
}
