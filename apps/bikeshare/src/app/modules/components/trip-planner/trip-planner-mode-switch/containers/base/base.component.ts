import { Component, Input, OnInit } from '@angular/core';
import { TripModeSwitch, TripPlannerService } from '../../../../../services/trip-planner/trip-planner.service';
import { TripResult } from '../../../../../services/trip-planner/core/trip-planner-core';
import { BusService } from '../../../../../services/transportation/bus/bus.service';

@Component({
  selector: 'trip-planner-mode-switch',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss']
})
export class TripPlannerModeSwitchComponent implements OnInit {
  @Input()
  public modeSwitch: TripModeSwitch = null;

  @Input()
  public result: TripResult;

  public mode_header = '';
  public mode_icon?: string = null;

  constructor(private tripPlanner: TripPlannerService, private busService: BusService) {}

  public ngOnInit(): void {
    if (this.result && !this.result.isError) {
      this.setModeHeader();
    }
  }

  private setModeHeader(): void {
    if (this.result == null || this.result.params == null) {
      this.mode_icon = null;
      this.mode_header = '';
      return;
    }
    let { travelMode } = this.result.params;

    // `walking` refers to the segment speed identification by the trip planner `speed` fn as part of a
    // successful trip query
    if (this.modeSwitch && this.modeSwitch.type === 'walking') {
      travelMode = '1';
    }

    const rule = this.tripPlanner.getRuleForModes([parseInt(travelMode, 10)]);
    const mode = this.tripPlanner.getTravelModeFromRule(rule);

    this.mode_icon = mode.directions_icon;
    this.mode_header = mode.directions_verb;
  }
}
