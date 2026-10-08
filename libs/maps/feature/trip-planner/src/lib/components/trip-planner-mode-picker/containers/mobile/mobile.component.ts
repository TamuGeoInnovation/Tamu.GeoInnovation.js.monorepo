import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { pluck, map } from 'rxjs/operators';

import { TestingService } from '@tamu-gisc/dev-tools/application-testing';

import { TripPlannerService } from '../../../../services/trip-planner.service';
import { TripPlannerModePickerComponent } from '../base/base.component';
import { TripPlannerModeToggleComponent } from '../../../trip-planner-mode-toggle/containers/base/base.component';
import { NgClass, AsyncPipe } from '@angular/common';

@Component({
    selector: 'tamu-gisc-trip-planner-mode-picker-mobile',
    templateUrl: './mobile.component.html',
    styleUrls: ['../base/base.component.scss', './mobile.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [TripPlannerModeToggleComponent, NgClass, AsyncPipe]
})
export class TripPlannerModePickerMobileComponent extends TripPlannerModePickerComponent implements OnInit, OnDestroy {
  private _destroy$: Subject<boolean> = new Subject();

  public accessible: Observable<boolean>;
  public isAccessibleMode: Observable<boolean>;

  constructor(
    private tps: TripPlannerService,
    private dts: TestingService
  ) {
    super(tps, dts);
  }

  public ngOnInit() {
    this.accessible = this.tps.TravelOptions.pipe(pluck('accessible'));
    this.isAccessibleMode = this.tps.TravelOptions.pipe(
      pluck('travel_mode'),
      map(() => {
        return this.tps.verifyRuleAccessibility();
      })
    );
  }

  public ngOnDestroy() {
    this._destroy$.next(undefined);
    this._destroy$.complete();
  }
}
