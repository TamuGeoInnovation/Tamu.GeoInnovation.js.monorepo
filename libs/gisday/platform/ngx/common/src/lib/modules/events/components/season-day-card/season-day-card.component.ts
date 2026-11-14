import {
  Component,
  OnChanges,
  OnInit,
  SimpleChanges,
  ChangeDetectionStrategy,
  computed,
  inject,
  input,
  output
} from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject, combineLatest, map, shareReplay, tap } from 'rxjs';

import { SeasonDay, SimplifiedEvent } from '@tamu-gisc/gisday/platform/data-api';
import { SeasonDayService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { EventRowComponent } from '../event-row/event-row.component';
import { matchesText, sessionSearchFields } from '../../../../utils/search-text';
import { AsyncPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'tamu-gisc-season-day-card',
  templateUrl: './season-day-card.component.html',
  styleUrls: ['./season-day-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [EventRowComponent, AsyncPipe, DatePipe]
})
export class SeasonDayCardComponent implements OnInit, OnChanges {
  private readonly sd = inject(SeasonDayService);

  public readonly seasonDay = input<Partial<SeasonDay>>(undefined);

  public readonly index = input<number>(undefined);

  /**
   * Collection of ID's, each representing a tag guid that should be used to filter events.
   */
  public readonly tags = input<Array<string>>([]);

  /**
   * Collection of ID's, each representing an organization guid that should be used to filter events.
   */
  public readonly organizations = input<Array<string>>([]);

  /**
   * The places whose events the site lists at all, whatever the filters, or null for every place. Texas A&M's site
   * lists only Texas A&M's sessions (#2142).
   */
  public readonly onlyFrom = input<Array<string> | null>(null);

  /**
   * The Sessions page's search (#2944): only the sessions whose name, building, room or presenter contains it are
   * listed, alongside the tags and organizations; while it finds none of the day's, the day is left out.
   */
  public readonly search = input<string>('');

  /** Whether a search is in use, so a day it finds nothing in is left out rather than shown empty. */
  public readonly searching = computed(() => (this.search() ?? '').trim().length > 0);

  public readonly rsvps = input<Array<string>>([]);

  /**
   * False on a past year, whose sessions can no longer be registered for.
   */
  public readonly canRegister = input<boolean>(true);

  public readonly register = output<string>();

  public readonly unregister = output<string>();

  /** How many of the day's sessions the filters and search leave, each time that changes, so the page can tell when none do. */
  public readonly matches = output<number>();

  public events$: Observable<Array<SimplifiedEvent>>;
  public filteredEvents$: Observable<Array<SimplifiedEvent>>;
  public rsvpsForDay$: Observable<Array<string>>;

  /**
   * Observable that gets pushed the input `tags` on changes.
   */
  private _activeTagFilters: BehaviorSubject<Array<string>> = new BehaviorSubject<Array<string>>([]);

  /**
   * Observable that gets pushed the input `organizations` on changes.
   */
  private _activeOrgFilters: BehaviorSubject<Array<string>> = new BehaviorSubject<Array<string>>([]);

  /**
   * Observable that gets pushed the input `onlyFrom` on changes.
   */
  private _onlyFrom: BehaviorSubject<Array<string> | null> = new BehaviorSubject<Array<string> | null>(null);

  /**
   * Observable that gets pushed the input `search` on changes.
   */
  private _search: BehaviorSubject<string> = new BehaviorSubject<string>('');

  private _activeRsvpsForDay: ReplaySubject<Array<string>> = new ReplaySubject<Array<string>>();

  public ngOnInit(): void {
    this.events$ = this.sd.getDayEvents(this.seasonDay().guid).pipe(shareReplay());

    // The events are combined rather than taken withLatestFrom: the template now reads this list before the events have
    // arrived, to know whether to leave the day out (#2944), and withLatestFrom would drop the filters it saw then.
    this.filteredEvents$ = combineLatest([
      this._activeTagFilters,
      this._activeOrgFilters,
      this._onlyFrom,
      this._search,
      this.events$
    ]).pipe(
      map(([tags, orgs, onlyFrom, search, events]) => {
        return events.filter((simplifiedEvent) => {
          if (onlyFrom !== null && !simplifiedEvent.organizations?.some((place) => onlyFrom.includes(place))) {
            return false;
          }

          if (!matchesText(sessionSearchFields(simplifiedEvent), search)) {
            return false;
          }

          const hasTags = this._hasFilterIdentity(simplifiedEvent.tags, tags);
          const hasOrgs = this._hasFilterIdentity(simplifiedEvent.organizations, orgs);

          if (tags.length > 0 && orgs.length > 0) {
            return hasTags && hasOrgs;
          } else if (tags.length > 0) {
            return hasTags;
          }
          return hasOrgs;
        });
      }),
      tap((shown) => this.matches.emit(shown.length)),
      shareReplay()
    );

    this.rsvpsForDay$ = combineLatest([this.events$, this._activeRsvpsForDay]).pipe(
      map(([events, rsvps]) => {
        return events.filter((event) => {
          return rsvps.includes(event.guid);
        });
      }),
      map((events) => {
        if (events.length === 0) {
          return [];
        }

        return events.map((event) => {
          return event.guid;
        });
      })
    );

    // this._activeOrgFilters.next(this.organizations);
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.tags && changes.tags.currentValue !== null) {
      this._activeTagFilters.next(changes.tags.currentValue);
    }

    if (changes.organizations && changes.organizations.currentValue !== null) {
      this._activeOrgFilters.next(changes.organizations.currentValue);
    }

    if (changes.onlyFrom) {
      this._onlyFrom.next(changes.onlyFrom.currentValue ?? null);
    }

    if (changes.search) {
      this._search.next(changes.search.currentValue ?? '');
    }

    if (changes.rsvps && changes.rsvps.currentValue !== null) {
      this._activeRsvpsForDay.next(changes.rsvps.currentValue);
    }
  }

  public handoff(event: SimplifiedEvent, newState: boolean) {
    if (newState) {
      this.register.emit(event.guid);
    } else if (!newState) {
      this.unregister.emit(event.guid);
    }
  }

  private _hasFilterIdentity(identities: Array<string>, tags: Array<string>): boolean {
    if (tags.length === 0) {
      return true;
    }

    return identities.some((t) => {
      return tags.includes(t);
    });
  }
}
