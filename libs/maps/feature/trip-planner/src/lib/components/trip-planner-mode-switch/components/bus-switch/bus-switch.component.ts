import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject, input } from '@angular/core';
import { Subject } from 'rxjs';

import { timeStringForDate } from '@tamu-gisc/common/utils/date';

import { TripModeSwitch } from '../../../../services/trip-planner.service';
import { BusStop, TimetableRow, BusService } from '../../../../services/transportation/bus/bus.service';
import { NgClass } from '@angular/common';

import { AccordionComponent } from '@tamu-gisc/ui-kits/ngx/layout';
import { AccordionContentComponent } from '@tamu-gisc/ui-kits/ngx/layout';

@Component({
  selector: 'tamu-gisc-gisc-bus-switch',
  templateUrl: './bus-switch.component.html',
  styleUrls: ['../../containers/base/base.component.scss', './bus-switch.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [NgClass, AccordionComponent, AccordionContentComponent]
})
export class TripPlannerBusModeSwitchComponent implements OnInit, OnDestroy {
  private busService = inject(BusService);

  public readonly switch = input<TripModeSwitch>(undefined);

  private $destroy: Subject<boolean> = new Subject();

  public busStops: Array<BusStop> = [];
  public busStopsList: Array<BusStop> = [];
  public stopCount = 0;
  public routeNumber?: string = null;
  public timetable: TimetableRow[] = [];
  public lingerMinutes?: number = null;
  public passengerLoad?: number = null;
  public busCount?: number = null;
  public now: TimetableRow;

  public timeTableExpanded = false;

  public rideDuration: number;

  public ngOnInit() {
    const modeSwitch = this.switch();
    if (modeSwitch && modeSwitch.results && modeSwitch.results.bus != null) {
      this.routeNumber = modeSwitch.results.bus.route_number;
      this.lingerMinutes = modeSwitch.results.bus.linger_minutes;
      this.timetable = modeSwitch.results.bus.timetable;

      this.now = this.timetable[0];

      this.busStopsList = this.now.stops.slice(this.now.first + 1, this.now.last);

      if (this.now.first > this.now.last) {
        // handle wraparound
        this.stopCount = modeSwitch.results.bus.stop_count - this.now.first + this.now.last - 1;
      } else {
        this.stopCount = this.now.last - this.now.first - 1;
      }

      // TODO: Keep or remove.
      // This determines the bus load/capacity
      //
      // this.busService.busesForRoute(this.routeNumber).subscribe((buses: RouteBus[]) => {
      //   const total_for_route = buses.reduce(
      //     (prev, cur) => ({
      //       current: prev.current + cur.current_passengers,
      //       total: prev.total + cur.passenger_capacity
      //     }),
      //     { current: 0, total: 0 }
      //   );
      //   this.passengerLoad = Math.round((total_for_route.current / total_for_route.total) * 100);
      //   this.busCount = buses.length;
      // });
    }
  }

  public ngOnDestroy(): void {
    this.$destroy.next(true);
    this.$destroy.complete();
  }

  public getDateString(time) {
    return timeStringForDate(time);
  }
}
