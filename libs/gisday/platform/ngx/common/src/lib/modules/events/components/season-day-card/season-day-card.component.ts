import {
  Component,
  OnChanges,
  OnInit,
  SimpleChanges,
  ChangeDetectionStrategy,
  DestroyRef,
  computed,
  inject,
  input,
  linkedSignal,
  output,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, ReplaySubject, combineLatest, map, of, shareReplay, tap } from 'rxjs';

import { SeasonDay, SimplifiedEvent } from '@tamu-gisc/gisday/platform/data-api';
import { SeasonDayService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { EventRowComponent } from '../event-row/event-row.component';
import { matchesText, sessionSearchFields } from '../../../../utils/search-text';
import { AsyncPipe } from '@angular/common';
import { dayHasPassed } from '@tamu-gisc/gisday/common';
import { AccordionComponent, AccordionContentComponent, AccordionHeaderComponent } from '@tamu-gisc/ui-kits/ngx/layout';
import { CentralDatePipe } from '../../../../pipes/central-date/central-date.pipe';

@Component({
  selector: 'tamu-gisc-season-day-card',
  templateUrl: './season-day-card.component.html',
  styleUrls: ['./season-day-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    EventRowComponent,
    AsyncPipe,
    CentralDatePipe,
    AccordionComponent,
    AccordionHeaderComponent,
    AccordionContentComponent
  ]
})
export class SeasonDayCardComponent implements OnInit, OnChanges {
  private readonly sd = inject(SeasonDayService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  public readonly seasonDay = input.required<Partial<SeasonDay>>();

  public readonly index = input.required<number>();

  /**
   * Collection of ID's, each representing a tag guid that should be used to filter events.
   */
  public readonly tags = input<Array<string> | null>([]);

  /**
   * Collection of ID's, each representing an organization guid that should be used to filter events.
   */
  public readonly organizations = input<Array<string> | null>([]);

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

  public readonly rsvps = input<Array<string> | null>([]);

  /**
   * False on a past year, whose sessions can no longer be registered for.
   */
  public readonly canRegister = input<boolean>(true);

  /**
   * Whether a day that has passed starts collapsed (#3221): true on the current year's page. A past year's days have
   * all passed, and are shown open.
   */
  public readonly collapsePassed = input<boolean>(false);

  /** Whether the visitor opened (true) or closed (false) the day themselves, or null while they have not. */
  private readonly _chosen = signal<boolean | null>(null);

  /**
   * Whether the day is open, as decided on #3221: open while a search is in use (a day it finds nothing in is left out
   * altogether); otherwise as the visitor left it; otherwise collapsed if it has passed and `collapsePassed` is set.
   */
  private readonly _open = computed(() => {
    if (this.searching()) {
      return true;
    }

    return this._chosen() ?? !(this.collapsePassed() && dayHasPassed(this.seasonDay()?.date));
  });

  /** The accordion's state: it follows `_open`, and the header opening or closing it. */
  public readonly expanded = linkedSignal(() => this._open());

  /** The day's id, which the page's Day 1, Day 2 links jump to. */
  public readonly anchor = computed(() => `day${this.index() + 1}`);

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
    // The page's Day 1, Day 2 links open the day they jump to (#3221).
    this.route.fragment.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((fragment) => {
      if (fragment === this.anchor()) {
        this.choose(true);
      }
    });

    // A day not yet saved has no guid, and so no events to ask for.
    const guid = this.seasonDay().guid;
    this.events$ = (guid ? this.sd.getDayEvents(guid) : of([])).pipe(shareReplay());

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
      map(([events, rsvps]) => events.flatMap((event) => (event.guid && rsvps.includes(event.guid) ? [event.guid] : [])))
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

  /** The visitor opened or closed the day. */
  public choose(open: boolean) {
    this._chosen.set(open);
    this.expanded.set(open);
  }

  public handoff(event: SimplifiedEvent, newState: boolean) {
    // An event with no guid cannot be registered for: there is nothing to send.
    if (!event.guid) {
      return;
    }

    if (newState) {
      this.register.emit(event.guid);
    } else {
      this.unregister.emit(event.guid);
    }
  }

  /** Whether the event has one of the filter's ids. An event that lists none has none of them. */
  private _hasFilterIdentity(identities: Array<string> | undefined, tags: Array<string>): boolean {
    if (tags.length === 0) {
      return true;
    }

    return identities?.some((t) => tags.includes(t)) ?? false;
  }
}
