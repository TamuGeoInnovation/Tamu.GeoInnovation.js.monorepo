import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, Observable, shareReplay, startWith, Subject } from 'rxjs';

import { Angulartics2 } from 'angulartics2';

import { ResidenceHall, ResidenceZones } from '../../../../interfaces/ring-day.interface';
import { MoveInOutSettingsService } from '../../../map/services/move-in-out-settings/move-in-out-settings.service';

@Component({
  selector: 'tamu-gisc-zone-select',
  templateUrl: './zone-select.component.html',
  styleUrls: ['./zone-select.component.scss']
})
export class ZoneSelectComponent implements OnInit {
  public savedResidence: Observable<ResidenceHall>;

  public zones: ResidenceZones = this.mioSettings.zones;

  private _refresh$: Subject<void> = new Subject();

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly angulartics: Angulartics2,
    private readonly mioSettings: MoveInOutSettingsService
  ) {}

  public ngOnInit() {
    // Load saved value from local storage
    this.savedResidence = this._refresh$.pipe(
      startWith(undefined),
      map(() => this.mioSettings.savedResidence),
      shareReplay()
    );
  }

  /**
   * Saves component value in local storage
   */
  public saveResidence = (item: ResidenceHall): void => {
    const confirm = this.mioSettings.saveResidence(item);

    if (confirm != undefined) {
      this.angulartics.eventTrack.next({
        action: 'settings_set',
        properties: {
          category: 'residence',
          gstCustom: {
            residence_name: confirm.name,
            residence_number: confirm.Bldg_Number
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
      throw new Error('Failed to save hall selection.');
    }
  };
}
