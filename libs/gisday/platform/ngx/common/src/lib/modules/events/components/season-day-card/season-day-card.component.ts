import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Observable, Subject, combineLatest, map, shareReplay, startWith, withLatestFrom } from 'rxjs';

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

  public events$: Observable<Array<SimplifiedEvent>>;
  public filteredEvents$: Observable<Array<SimplifiedEvent>>;

  /**
   * Observable that gets pushed the input `tags` on changes.
   */
  private _activeTagFilters: Subject<Array<string>> = new Subject<Array<string>>();

  /**
   * Observable that gets pushed the input `organizations` on changes.
   */
  private _activeOrgFilters: Subject<Array<string>> = new Subject<Array<string>>();

  constructor(private readonly sd: SeasonDayService) {}

  public ngOnInit(): void {
    this.events$ = this.sd.getDayEvents(this.seasonDay.guid).pipe(shareReplay());
    this.filteredEvents$ = combineLatest([
      this._activeTagFilters.pipe(startWith([])),
      this._activeOrgFilters.pipe(startWith([]))
    ]).pipe(
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
      })
    );
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.tags) {
      this._activeTagFilters.next(changes.tags.currentValue);
    }

    if (changes.organizations) {
      this._activeOrgFilters.next(changes.organizations.currentValue);
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
