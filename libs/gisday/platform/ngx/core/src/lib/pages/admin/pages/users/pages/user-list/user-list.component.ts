import { Component, OnInit, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormControl } from '@angular/forms';
import {
  Observable,
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  of,
  shareReplay,
  startWith,
  switchMap
} from 'rxjs';

import { UserService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { Auth0UserList } from '@tamu-gisc/common/nest/auth';
import { readRefusal, serverMessage } from '@tamu-gisc/gisday/platform/ngx/common';

import { AdminSearchComponent } from '../../../base-admin-list/admin-search.component';

/** The shortest search Auth0 runs with a wildcard. */
const SEARCH_MIN_LENGTH = 3;

@Component({
  selector: 'tamu-gisc-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  imports: [AsyncPipe, AdminSearchComponent]
})
export class UserListComponent implements OnInit {
  private readonly us = inject(UserService);

  /**
   * The search, in the shared admin search box (#2914). Users are not a season's, so this page searches its own list,
   * and it asks the API, which searches every Auth0 user, not only the first 1,000 the list can hold (#2574).
   */
  public readonly search = new FormControl('', { nonNullable: true });

  /**
   * The users the API gives, and whether the list was cut off at Auth0's 1,000; or why there are none to show (a search
   * too short, or refused); null while they load (#3116).
   */
  public users$: Observable<(Auth0UserList & { note?: undefined }) | { note: string; users?: undefined } | null>;
  /** How many are listed, for the search box. */
  public counts$: Observable<{ shown: number; total: number } | null>;

  public ngOnInit(): void {
    this.users$ = this.search.valueChanges.pipe(
      debounceTime(400),
      startWith(this.search.value),
      map((q) => q.trim()),
      distinctUntilChanged(),
      switchMap((q) => {
        // Auth0 searches with a wildcard only from 3 characters (#3116).
        if (q && q.length < SEARCH_MIN_LENGTH) {
          return of({ note: 'Type at least 3 letters of a name or email to search.' });
        }

        return this.us.getUsers(q || undefined).pipe(
          // A refusal says why, rather than leaving the spinner for ever (#3116).
          catchError((err) =>
            of({ note: readRefusal(err) ?? serverMessage(err, 'The users could not be loaded. Please try again.') })
          ),
          startWith(null)
        );
      }),
      shareReplay(1)
    );
    this.counts$ = this.users$.pipe(
      map((list) => (list?.users ? { shown: list.users.length, total: list.users.length } : null))
    );
  }
}
