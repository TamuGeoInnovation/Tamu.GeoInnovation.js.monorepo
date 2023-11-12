import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject, combineLatest, map, shareReplay, withLatestFrom } from 'rxjs';

import { SeasonDay, SimplifiedEvent } from '@tamu-gisc/gisday/platform/data-api';
import { SeasonDayService } from '@tamu-gisc/gisday/platform/ngx/data-access';

@Component({
  selector: 'tamu-gisc-season-day-card',
  templateUrl: './season-day-card.component.html',
  styleUrls: ['./season-day-card.component.scss']
})
export class SeasonDayCardComponent implements OnInit, OnChanges {
  @Input()
  public seasonDay: Partial<SeasonDay>;

  @Input()
  public index: number;

  /**
   * Collection of ID's, each representing a tag guid that should be used to filter events.
   */
  @Input()
  public tags: Array<string> = [];

  /**
   * Collection of ID's, each representing an organization guid that should be used to filter events.
   */
  @Input()
  public organizations: Array<string> = [];

  @Input()
  public rsvps: Array<string> = [];

  @Output()
  public register: EventEmitter<string> = new EventEmitter();

  @Output()
  public unregister: EventEmitter<string> = new EventEmitter();

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

  private _activeRsvpsForDay: ReplaySubject<Array<string>> = new ReplaySubject<Array<string>>();

  constructor(private readonly sd: SeasonDayService) {}

  public ngOnInit(): void {
    this.events$ = this.sd.getDayEvents(this.seasonDay.guid).pipe(shareReplay());

    this.filteredEvents$ = combineLatest([this._activeTagFilters, this._activeOrgFilters]).pipe(
      withLatestFrom(this.events$),
      map(([[tags, orgs], events]) => {
        return events.filter((simplifiedEvent) => {
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
