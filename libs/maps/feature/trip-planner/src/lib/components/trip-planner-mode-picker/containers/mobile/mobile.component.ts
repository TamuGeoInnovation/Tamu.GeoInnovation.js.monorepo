import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

import { TripPlannerService } from '../../../../services/trip-planner.service';
import { TripPlannerModePickerComponent } from '../base/base.component';

@Component({
  selector: 'tamu-gisc-trip-planner-mode-picker-mobile',
  templateUrl: './mobile.component.html',
  styleUrls: ['../base/base.component.scss', './mobile.component.scss']
})
export class TripPlannerModePickerMobileComponent extends TripPlannerModePickerComponent implements OnInit, OnDestroy {
  private _destroy$: Subject<boolean> = new Subject();

  public accessible: boolean;

  constructor(private tps: TripPlannerService) {
    super(tps);
  }

  public ngOnInit() {
    //
    // TODO: Might be able to be removed, depending on new mobile travel options  UI requirements
    //
    // this.tps.Accessible.pipe(takeUntil(this._destroy$)).subscribe((value) => {
    //   this.accessible = value;
    // });
  }

  public ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
