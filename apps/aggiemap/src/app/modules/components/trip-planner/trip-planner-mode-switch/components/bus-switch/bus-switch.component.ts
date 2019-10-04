import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

import { TripModeSwitch } from '../../../../../services/trip-planner/trip-planner.service';
import { BusStop, TimetableRow, BusService } from '../../../../../services/transportation/bus/bus.service';

import { timeStringForDate } from '@tamu-gisc/common/utils/date';

@Component({
  selector: 'gisc-bus-switch',
  templateUrl: './bus-switch.component.html',
  styleUrls: ['../../containers/base/base.component.scss', './bus-switch.component.scss']
})
export class TripPlannerBusModeSwitchComponent implements OnInit, OnDestroy {
  @Input()
  public switch: TripModeSwitch;

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

  constructor(private busService: BusService) {}

  public ngOnInit() {
    if (this.switch && this.switch.results && this.switch.results.bus != null) {
      this.routeNumber = this.switch.results.bus.route_number;
      this.lingerMinutes = this.switch.results.bus.linger_minutes;
      this.timetable = this.switch.results.bus.timetable;

      this.now = this.timetable[0];

      const first = this.now.stops[this.now.first];
      const last = this.now.stops[this.now.last];

      this.busStopsList = this.now.stops.slice(this.now.first + 1, this.now.last);

      if (this.now.first > this.now.last) {
        // handle wraparound
        this.stopCount = this.switch.results.bus.stop_count - this.now.first + this.now.last - 1;
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
