import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, Observable, shareReplay, startWith, Subject } from 'rxjs';

import { Angulartics2 } from 'angulartics2';

import { MoveInOutSettingsService } from '../../../map/services/move-in-out-settings/move-in-out-settings.service';

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
    private readonly mioSettings: MoveInOutSettingsService
  ) {}

  public ngOnInit() {
    this.savedAccessible = this._refresh$.pipe(
      startWith(undefined),
      map(() => this.mioSettings.savedAccessible),
      shareReplay()
    );
  }

  /**
   * Saves component value in local storage
   */
  public saveAccessible = (item: boolean): void => {
    const confirm = this.mioSettings.saveAccommodations(item);

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
        this.router.navigate(['builder/review']);
      }
    } else {
      throw new Error('Error saving accommodation selection.');
    }
  };
}
