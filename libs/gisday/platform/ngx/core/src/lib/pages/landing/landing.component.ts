import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import {
  distinctUntilChanged,
  filter,
  interval,
  map,
  NEVER,
  Observable,
  pipe,
  shareReplay,
  startWith,
  Subscription,
  switchMap
} from 'rxjs';

import { PlaceService, SeasonService, SponsorService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { ActiveSeasonDto, Place, SeasonDay, Sponsor } from '@tamu-gisc/gisday/platform/data-api';

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
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  private title = 'TxGIS Day';
  public timeTill: Date = new Date();
  public daysTill: string;
  public subscription: Subscription;

  public activeSeason$: Observable<ActiveSeasonDto>;
  public activeSeasonDays$: Observable<Array<SeasonDay>>;
  public activeSeasonDayCount$: Observable<number>;
  public dateRange$: Observable<Array<Date>>;
  public dayCountText$: Observable<string>;

  public totalSecondsRemaining$: Observable<number>;
  public minutesUntil$: Observable<string>;
  public hoursUntil$: Observable<string>;
  public daysUntil$: Observable<string>;
  public secondsUntil$: Observable<string>;
  public seasonStarted$: Observable<boolean>;

  public sponsors$: Observable<Array<Partial<Sponsor>>>;
  public organizations$: Observable<Array<Partial<Place>>>;

  constructor(
    private titleService: Title,
    private readonly seasonService: SeasonService,
    private readonly sponsorService: SponsorService,
    private readonly placeService: PlaceService
  ) {}

  public ngOnInit() {
    this.titleService.setTitle(this.title);

    this.activeSeason$ = this.seasonService.getActiveSeason().pipe(shareReplay());
    this.sponsors$ = this.sponsorService.getEntitiesForActiveSeason().pipe(shareReplay());
    this.organizations$ = this.placeService.getEntitiesForActiveSeason().pipe(shareReplay());

    this.activeSeasonDays$ = this.activeSeason$.pipe(
      map((season) => season?.days),
      filter((days) => {
        return days !== undefined;
      }),
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
        } else if (count > 1) {
          return `${numberDictionary[count]} days of workshops`;
        }
      })
    );

    this.totalSecondsRemaining$ = this.activeSeason$.pipe(
      switchMap((season) => {
        if (season.firstEventTime === null) {
          return NEVER;
        }

        return interval(1000).pipe(
          startWith(0),
          map(() => {
            const firstEventDate = new Date(new Date(season?.days[0].date).toDateString() + ' ' + season.firstEventTime);

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
