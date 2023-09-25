import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { filter, interval, map, Observable, Subscription } from 'rxjs';

import { SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { SeasonDay } from '@tamu-gisc/gisday/platform/data-api';

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
  private title = 'TxGIS Day 2022';
  private rightNow: Date;
  private firstDay: Date;
  public timeTill: Date = new Date();
  public daysTill: string;
  public subscription: Subscription;

  public activeSeason$ = this.ss.getActiveSeason();
  public activeSeasonDays$: Observable<Array<SeasonDay>>;
  public activeSeasonDayCount$: Observable<number>;
  public dateRange$: Observable<Array<Date>>;
  public dayCountText$: Observable<string>;

  private source = interval(1000);

  constructor(private titleService: Title, private readonly ss: SeasonService) {}

  public ngOnInit() {
    this.titleService.setTitle(this.title);

    this.rightNow = new Date(Date.now());
    this.firstDay = new Date(2022, 10, 13, 14, 30, 0, 0); // Idk why but we have to take a month and a day off for the numbers to add up - Aaron H (3/26/22)

    this.loadCountdown();

    this.activeSeasonDays$ = this.ss.getActiveSeason().pipe(
      map((season) => season?.days),
      filter((days) => {
        return days !== undefined;
      })
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
  }

  public loadCountdown() {
    this.subscription = this.source.subscribe(() => {
      this.rightNow = new Date(Date.now());
      this.timeTill = new Date(this.firstDay.getTime() - this.rightNow.getTime());
      const milliseconds = this.firstDay.getTime() - this.rightNow.getTime();
      this.daysTill = (milliseconds / 1000 / 86400).toFixed(0); // Converts from milliseconds to seconds to days (86400 seconds in a day)
    });
  }
}
