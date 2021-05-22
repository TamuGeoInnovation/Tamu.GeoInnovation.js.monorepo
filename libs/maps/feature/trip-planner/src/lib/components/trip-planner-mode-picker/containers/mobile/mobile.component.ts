import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { pluck, map } from 'rxjs/operators';

import { TestingService } from '@tamu-gisc/dev-tools/application-testing';

import { TripPlannerService } from '../../../../services/trip-planner.service';
import { TripPlannerModePickerComponent } from '../base/base.component';

@Component({
  selector: 'tamu-gisc-trip-planner-mode-picker-mobile',
  templateUrl: './mobile.component.html',
  styleUrls: ['../base/base.component.scss', './mobile.component.scss']
})
export class TripPlannerModePickerMobileComponent extends TripPlannerModePickerComponent implements OnInit, OnDestroy {
  private _destroy$: Subject<boolean> = new Subject();

  public accessible: Observable<boolean>;
  public isAccessibleMode: Observable<boolean>;

  constructor(private tps: TripPlannerService, private dts: TestingService) {
    super(tps, dts);
  }

  public ngOnInit() {
    this.accessible = this.tps.TravelOptions.pipe(pluck('accessible'));
    this.isAccessibleMode = this.tps.TravelOptions.pipe(
      pluck('travel_mode'),
      map((mode) => {
        return this.tps.verifyRuleAccessibility();
      })
    );
  }

  public ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
