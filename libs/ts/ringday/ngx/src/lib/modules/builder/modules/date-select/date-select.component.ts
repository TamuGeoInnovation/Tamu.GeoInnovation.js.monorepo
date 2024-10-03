import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, Observable, shareReplay, startWith, Subject } from 'rxjs';

import { Angulartics2 } from 'angulartics2';

import { EventDates } from '../../../../interfaces/ring-day.interface';
import { RingDaySettingsService } from '../../../map/services/settings/ring-day-settings.service';

@Component({
  selector: 'tamu-gisc-date-select',
  templateUrl: './date-select.component.html',
  styleUrls: ['./date-select.component.scss']
})
export class DateSelectComponent implements OnInit {
  public dates: EventDates;
  public timestampedDates: Array<Date>;
  public savedDate: Observable<string>;

  private _refresh$: Subject<void> = new Subject();

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly angulartics: Angulartics2,
    private readonly eventSettingsService: RingDaySettingsService
  ) {}

  public ngOnInit() {
    this.dates = this.eventSettingsService.days;
    this.savedDate = this._refresh$.pipe(
      startWith(undefined),
      map(() => this.eventSettingsService.eventDate),
      shareReplay()
    );

    // Convert dates objects using day and month properties to Date objects. These will be used in template with date pipe.
    this.timestampedDates = this.dates.map((d) => new Date(new Date().getFullYear(), d.month - 1, d.day));
  }

  /**
   * Saves component value in local storage
   */
  public saveDate = (item: Date) => {
    const saved = this.eventSettingsService.saveEventDate(item);

    if (saved != undefined) {
      this.angulartics.eventTrack.next({
        action: 'settings_set',
        properties: {
          category: 'date',
          gstCustom: {
            event_value: item.getTime()
          }
        }
      });

      this._refresh$.next();

      const hasRet = this.route.snapshot.queryParams['ret'];

      if (hasRet !== undefined) {
        this.router.navigate([`builder/${hasRet}`]);
      } else {
        this.router.navigate(['builder/accommodations']);
      }
    } else {
      throw new Error('Failed to save date selection.');
    }
  };
}
