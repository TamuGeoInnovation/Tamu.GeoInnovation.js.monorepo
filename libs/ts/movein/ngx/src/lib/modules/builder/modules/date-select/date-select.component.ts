import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, Observable, shareReplay, startWith, Subject } from 'rxjs';

import { Angulartics2 } from 'angulartics2';

import { LocalStoreService } from '@tamu-gisc/common/ngx/local-store';

import { MoveDates } from '../../../../interfaces/move-in-out.interface';
import { MoveInOutSettingsService } from '../../../map/services/move-in-out-settings/move-in-out-settings.service';

@Component({
  selector: 'tamu-gisc-date-select',
  templateUrl: './date-select.component.html',
  styleUrls: ['./date-select.component.scss']
})
export class DateSelectComponent implements OnInit {
  public dates: MoveDates;
  public timestampedDates: Array<Date>;
  public savedDate: Observable<string>;

  private _$refresh: Subject<void> = new Subject();

  constructor(
    private readonly store: LocalStoreService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly angulartics: Angulartics2,
    private readonly mioSettings: MoveInOutSettingsService
  ) {}

  public ngOnInit() {
    this.dates = this.mioSettings.days;
    this.savedDate = this._$refresh.pipe(
      startWith(undefined),
      map(() => this.mioSettings.eventDate),
      shareReplay()
    );

    // Convert dates objects using day and month properties to Date objects. These will be used in template with date pipe.
    this.timestampedDates = this.dates.in.map((d) => new Date(new Date().getFullYear(), d.month - 1, d.day));
  }

  /**
   * Saves component value in local storage
   */
  public saveDate = (item: Date) => {
    const saved = this.mioSettings.saveEventDate(item);

    if (saved != undefined) {
      this.angulartics.eventTrack.next({
        action: 'Date Select',
        properties: {
          category: 'UI Interaction',
          label: confirm
        }
      });

      this._$refresh.next();

      const hasRet = this.route.snapshot.queryParams['ret'];

      if (hasRet !== undefined) {
        this.router.navigate([`builder/${hasRet}`]);
      } else {
        this.router.navigate(['builder/zone']);
      }
    }
  };
}
