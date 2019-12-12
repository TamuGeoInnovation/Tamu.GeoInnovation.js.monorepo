import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil, shareReplay, pluck } from 'rxjs/operators';

import { TimeModeOption, TripPlannerService } from '../../../../../services/trip-planner/trip-planner.service';
import { DlDateTimePickerChange } from 'angular-bootstrap-datetimepicker';

@Component({
  selector: 'trip-planner-time-picker',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss']
})
export class TripPlannerTimePickerComponent implements OnInit, OnDestroy {
  /**
   * Trip time mode that determines how the trip results are modified.
   *
   * @type {Observable<TimeModeOption>}
   * @memberof TripPlannerTimePickerComponent
   */
  public timeMode: Observable<TimeModeOption> = this.plannerService.TravelOptions.pipe(
    pluck('time_mode'),
    shareReplay(1)
  );

  /**
   * Date in milliseconds. If a date is set in the trip planner service, it will be converted to miliseconds.
   *
   * @type {number}
   * @memberof TripPlannerTimePickerComponent
   */
  public requestedTime: Date;
  public oldTime: Date;

  public dateTimePickerVisible = false;

  /**
   * Subject that triggers on ngOnDestroy lifecycle hook to any active manual observable subscriptions.
   *
   * @private
   * @type {Subject<boolean>}
   * @memberof TripPlannerTimePickerComponent
   */
  private destroy$: Subject<boolean> = new Subject();

  constructor(private plannerService: TripPlannerService) {}

  public ngOnInit(): void {
    this.plannerService.TravelOptions.pipe(
      pluck('requested_time'),
      takeUntil(this.destroy$)
    ).subscribe((date) => {
      this.requestedTime = date ? date : undefined;
      this.oldTime = this.requestedTime ? new Date(this.requestedTime.getTime()) : undefined;
    });
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Set component time mode.
   *
   * Arrival and Departure time modes enable the time picker.
   *
   * @param {TimeModeOption} newTimeMode
   * @memberof TripPlannerTimePickerComponent
   */
  public setTimeMode(newTimeMode: TimeModeOption): void {
    this.plannerService.updateTravelOptions({ time_mode: newTimeMode });

    if (newTimeMode === 'now') {
      this.setRequestedTime(null);
      this.dateTimePickerVisible = false;
    } else {
      if (this.requestedTime == null) {
        this.dateTimePickerVisible = true;
        const date = new Date();
        this.setRequestedTime(date);
      }
    }
  }

  /**
   * Update trip planner requested time state value.
   *
   * The change can be triggered either by the own component or by the datetime picker component,
   * each of which have a different class signature. Handle both cases.
   *
   * Once the update is made in the trip planner service state, the component subscriber will be
   * notified and update it here.
   *
   * @param {(DlDateTimePickerChange<Date> | Date)} newRequestedTime
   * @memberof TripPlannerTimePickerComponent
   */
  public setRequestedTime(newRequestedTime: DlDateTimePickerChange<Date> | Date): void {
    if (newRequestedTime instanceof DlDateTimePickerChange) {
      if (newRequestedTime.value && this.oldTime.getTime() !== newRequestedTime.value.getTime()) {
        this.plannerService.updateTravelOptions({ requested_time: new Date(newRequestedTime.value.getTime()) });
        this.dateTimePickerVisible = false;
      }
    } else {
      this.plannerService.updateTravelOptions({ requested_time: newRequestedTime });
    }
  }
} 
