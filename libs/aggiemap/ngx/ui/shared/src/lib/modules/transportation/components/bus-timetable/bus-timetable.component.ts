import { Component, OnInit, Input, Output } from '@angular/core';
import { Observable, from } from 'rxjs';
import { tap, shareReplay, switchMap, filter, toArray } from 'rxjs/operators';

import { BusService, TSRoute, TimetableEntry } from '@tamu-gisc/maps/feature/trip-planner';

@Component({
  selector: 'tamu-gisc-bus-timetable',
  templateUrl: './bus-timetable.component.html',
  styleUrls: ['./bus-timetable.component.scss']
})
export class BusTimetableComponent implements OnInit {
  @Input()
  public route: TSRoute;

  public timetable: Observable<TimetableEntry[][]>;

  /**
   * Emits once when the component has received time table data.
   */
  @Output()
  public loaded: boolean;

  public nowDate: Date = new Date();

  constructor(private busService: BusService) {}

  public ngOnInit() {
    this.timetable = this.busService.timetableForRoute(this.route.ShortName).pipe(
      switchMap((timetable) => {
        return from(timetable);
      }),
      filter((row) => {
        return row.some((entry) => {
          return entry.datetime > this.nowDate;
        });
      }),
      toArray(),
      tap(() => {
        this.loaded = true;
      }),
      shareReplay(1)
    );
  }
}
