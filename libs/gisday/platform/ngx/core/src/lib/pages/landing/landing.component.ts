import { Component, OnInit, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import {
  catchError,
  distinctUntilChanged,
  filter,
  interval,
  map,
  NEVER,
  Observable,
  of,
  pipe,
  shareReplay,
  startWith,
  Subscription,
  switchMap
} from 'rxjs';
import { SeasonWinnersDto, placeLabel, placesShownOn, siteHas } from '@tamu-gisc/gisday/common';

import {
  PlaceService,
  SeasonService,
  SeasonWinnersService,
  SponsorService
} from '@tamu-gisc/gisday/platform/ngx/data-access';
import { ActiveSeasonDto, Place, SeasonDay, Sponsor } from '@tamu-gisc/gisday/platform/data-api';
import { PlaceVisibilityOptions, ImagePreviewComponent } from '@tamu-gisc/gisday/platform/ngx/common';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { AssetUrlPipe, activeSponsors } from '@tamu-gisc/gisday/platform/ngx/common';
import { GISDAY_SITE, SiteHasPipe } from '@tamu-gisc/gisday/platform/ngx/common';
import { CentralDatePipe } from '@tamu-gisc/gisday/platform/ngx/common';

const numberDictionary = {
  0: 'Zero',
  1: 'One',
  2: 'Two',
  3: 'Three',
  4: 'Four',
  5: 'Five',
  6: 'Six',
  7: 'Seven',
  8: 'Eight',
  9: 'Nine',
  10: 'Ten'
};

@Component({
  selector: 'tamu-gisc-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  imports: [ImagePreviewComponent, SiteHasPipe, RouterLink, AsyncPipe, CentralDatePipe, AssetUrlPipe]
})
export class LandingComponent implements OnInit {
  private titleService = inject(Title);
  private readonly seasonService = inject(SeasonService);
  private readonly sponsorService = inject(SponsorService);
  private readonly placeService = inject(PlaceService);
  private readonly winnersService = inject(SeasonWinnersService);

  public readonly site = inject(GISDAY_SITE);
  private title = this.site.name;
  public timeTill: Date = new Date();
  public daysTill: string;
  public subscription: Subscription;

  /** Null on a site with no season yet (#2076). */
  public activeSeason$: Observable<ActiveSeasonDto | null>;
  public activeSeasonDays$: Observable<Array<SeasonDay>>;
  public activeSeasonDayCount$: Observable<number>;
  /** The first and last days' dates, or null when the season has no days. */
  public dateRange$: Observable<Array<Date> | null>;
  public dayCountText$: Observable<string>;

  public totalSecondsRemaining$: Observable<number>;
  public minutesUntil$: Observable<string>;
  public hoursUntil$: Observable<string>;
  public daysUntil$: Observable<string>;
  public secondsUntil$: Observable<string>;
  public seasonStarted$: Observable<boolean>;

  public sponsors$: Observable<Array<Partial<Sponsor>>>;
  public organizations$: Observable<Array<Partial<Place>>>;

  /**
   * The research competitions' winners (#3239), on gisday.tamu.edu only (decided 2A), once the season's GIS Day is over:
   * the API answers with nothing before then. A failed read shows no section rather than an error on the homepage.
   */
  public readonly winners$: Observable<SeasonWinnersDto | null> = siteHas(this.site, 'winners')
    ? this.winnersService.shown().pipe(catchError(() => of(null)))
    : of(null);
  public readonly placeLabel = placeLabel;

  public ngOnInit() {
    this.titleService.setTitle(this.title);

    this.activeSeason$ = this.seasonService.getActiveSeason().pipe(shareReplay());
    // Sponsors switched off for the season are kept in the admin pages but not shown (#1962).
    this.sponsors$ = this.sponsorService.getEntitiesForActiveSeason().pipe(map(activeSponsors), shareReplay());
    this.organizations$ = this.placeService.getEntitiesForActiveSeason().pipe(
      map((places) => placesShownOn(this.site, places, PlaceVisibilityOptions.OrgPage)),
      shareReplay()
    );

    this.activeSeasonDays$ = this.activeSeason$.pipe(
      map((season) => season?.days),
      filter((days): days is Array<SeasonDay> => days !== undefined),
      shareReplay()
    );

    this.activeSeasonDayCount$ = this.activeSeasonDays$.pipe(map((days) => days.length));

    this.dateRange$ = this.activeSeasonDays$.pipe(
      map((days) => {
        if (days.length === 0) {
          return null;
        }

        const firstDay = days[0].date;
        const lastDay = days[days.length - 1].date;

        return [firstDay, lastDay];
      })
    );

    this.dayCountText$ = this.activeSeasonDayCount$.pipe(
      startWith(0),
      map((count) => {
        if (count === 0) {
          return 'Workshops';
        } else if (count === 1) {
          return 'One day of workshops';
        }

        return `${numberDictionary[count]} days of workshops`;
      })
    );

    this.totalSecondsRemaining$ = this.activeSeason$.pipe(
      switchMap((season) => {
        const firstDay = season?.days?.[0]?.date;

        // No countdown on a site with no season yet (#2076), or for a season with no session on its first day.
        if (!season || !firstDay || season.firstEventTime === null) {
          return NEVER;
        }

        const firstEventTime = season.firstEventTime;

        return interval(1000).pipe(
          startWith(0),
          map(() => {
            const firstEventDate = new Date(firstDay.toDateString() + ' ' + firstEventTime);

            return (firstEventDate.getTime() - Date.now()) / 1000;
          }),
          shareReplay()
        );
      })
    );

    this.seasonStarted$ = this.totalSecondsRemaining$.pipe(
      map((seconds) => seconds <= 0),
      distinctUntilChanged()
    );

    this.daysUntil$ = this.totalSecondsRemaining$.pipe(
      map((seconds) => Math.floor(seconds / 86400).toFixed(0)),
      this._pad(),
      distinctUntilChanged(),
      shareReplay()
    );

    this.hoursUntil$ = this.totalSecondsRemaining$.pipe(
      map((seconds) => Math.floor((seconds / 3600) % 24).toFixed(0)),
      this._pad(),
      distinctUntilChanged(),
      shareReplay()
    );

    this.minutesUntil$ = this.totalSecondsRemaining$.pipe(
      map((seconds) => Math.floor((seconds / 60) % 60).toFixed(0)),
      this._pad(),
      distinctUntilChanged(),
      shareReplay()
    );

    this.secondsUntil$ = this.totalSecondsRemaining$.pipe(
      map((seconds) => Math.floor(seconds % 60).toFixed(0)),
      this._pad(),
      shareReplay()
    );
  }

  private _pad() {
    return pipe(
      map((val: string) => {
        return val.padStart(2, '0');
      })
    );
  }
}
