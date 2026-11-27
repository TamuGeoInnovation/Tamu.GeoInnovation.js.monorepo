import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil, shareReplay, pluck } from 'rxjs/operators';

import { DateTimePickerChange } from '@tamu-gisc/ui-kits/ngx/forms/date-time-picker';

import { TimeModeOption, TripPlannerService } from '../../../../services/trip-planner.service';
import { NgClass, AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DateTimePickerComponent } from '@tamu-gisc/ui-kits/ngx/forms/date-time-picker';

@Component({
  selector: 'tamu-gisc-trip-planner-time-picker',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss'],
  imports: [NgClass, FormsModule, DateTimePickerComponent, AsyncPipe]
})
export class TripPlannerTimePickerComponent implements OnInit, OnDestroy {
  private plannerService = inject(TripPlannerService);

  /**
   * Trip time mode that determines how the trip results are modified.
   */
  public timeMode: Observable<TimeModeOption> = this.plannerService.TravelOptions.pipe(pluck('time_mode'), shareReplay(1));

  /**
   * The time the trip leaves at, as the picker takes it: a `Date`, and the same one until the planner's changes, or null
   * for none. It was the time in milliseconds, which the picker reads as no value, so a shared link's time drew a blank
   * picker (#2608).
   */
  public readonly requestedTime = signal<Date | null>(null);
  public oldTime: number;

  public dateTimePickerVisible = false;

  /**
   * Subject that triggers on ngOnDestroy life cycle hook to any active manual observable subscriptions.
   */
  private destroy$: Subject<boolean> = new Subject();

  public ngOnInit(): void {
    this.plannerService.TravelOptions.pipe(pluck('requested_time'), takeUntil(this.destroy$)).subscribe((date) => {
      this.requestedTime.set(date ? new Date(date.getTime()) : null);
      this.oldTime = date ? date.getTime() : undefined;
    });
  }

  public ngOnDestroy(): void {
    this.destroy$.next(undefined);
    this.destroy$.complete();
  }

  /**
   * Set component time mode.
   *
   * Arrival and Departure time modes enable the time picker.
   */
  public setTimeMode(event: Event): void {
    const newTimeMode = (event.target as HTMLInputElement).value as TimeModeOption;

    this.plannerService.updateTravelOptions({ time_mode: newTimeMode });

    if (newTimeMode === 'now') {
      this.setRequestedTime(null);
      this.dateTimePickerVisible = false;
    } else {
      if (this.requestedTime() == null) {
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
   */
  public setRequestedTime(newRequestedTime: DateTimePickerChange<Date> | Date): void {
    if (newRequestedTime instanceof DateTimePickerChange) {
      if (newRequestedTime.value && this.oldTime !== newRequestedTime.value.getTime()) {
        this.plannerService.updateTravelOptions({ requested_time: new Date(newRequestedTime.value.getTime()) });
        this.dateTimePickerVisible = false;
      }
    } else {
      this.plannerService.updateTravelOptions({ requested_time: newRequestedTime });
    }
  }
}
