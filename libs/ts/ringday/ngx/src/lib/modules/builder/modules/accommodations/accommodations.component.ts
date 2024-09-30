import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, Observable, shareReplay, startWith, Subject } from 'rxjs';

import { Angulartics2 } from 'angulartics2';

import { RingDaySettingsService } from '../../../map/services/settings/ring-day-settings.service';

@Component({
  selector: 'tamu-gisc-accommodations',
  templateUrl: './accommodations.component.html',
  styleUrls: ['./accommodations.component.scss']
})
export class AccommodationsComponent implements OnInit {
  public savedAccessible: Observable<boolean>;

  private _refresh$: Subject<void> = new Subject();

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly angulartics: Angulartics2,
    private readonly eventSettingsService: RingDaySettingsService
  ) {}

  public ngOnInit() {
    this.savedAccessible = this._refresh$.pipe(
      startWith(undefined),
      map(() => this.eventSettingsService.savedAccessible),
      shareReplay()
    );
  }

  /**
   * Saves component value in local storage
   */
  public saveAccessible = (item: boolean): void => {
    const confirm = this.eventSettingsService.saveAccommodations(item);

    if (confirm !== undefined) {
      this.angulartics.eventTrack.next({
        action: 'settings_set',
        properties: {
          category: 'accessible',
          gstCustom: {
            event_value: `${item}`
          }
        }
      });

      this._refresh$.next();

      const hasRet = this.route.snapshot.queryParams['ret'];

      if (hasRet !== undefined) {
        this.router.navigate([`builder/${hasRet}`]);
      } else {
        this.router.navigate(['builder/date']);
      }
    } else {
      throw new Error('Error saving accommodation selection.');
    }
  };
}
