import { Component, OnInit, inject, input } from '@angular/core';

import { TripResult } from '../../../../core/trip-planner-core';
import { TripModeSwitch, TripPlannerService } from '../../../../services/trip-planner.service';
import { BusService } from '../../../../services/transportation/bus/bus.service';
import { NgClass } from '@angular/common';
import { TripPlannerBusModeSwitchComponent } from '../../components/bus-switch/bus-switch.component';
import { RouteDirectionTransformerPipe } from '../../../../core/route-direction-transformer.pipe';

@Component({
  selector: 'tamu-gisc-trip-planner-mode-switch',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss'],
  imports: [NgClass, TripPlannerBusModeSwitchComponent, RouteDirectionTransformerPipe]
})
export class TripPlannerModeSwitchComponent implements OnInit {
  private tripPlanner = inject(TripPlannerService);
  private busService = inject(BusService);

  public readonly modeSwitch = input<TripModeSwitch>(null);

  public readonly result = input<TripResult>(undefined);

  public mode_header = '';
  public mode_icon?: string = null;

  public ngOnInit(): void {
    const result = this.result();
    if (result && !result.isError) {
      this.setModeHeader();
    }
  }

  private setModeHeader(): void {
    const result = this.result();
    if (result == null || result.params == null) {
      this.mode_icon = null;
      this.mode_header = '';
      return;
    }
    let travelMode = result.params.travelMode.id;

    // `walking` refers to the segment speed identification by the trip planner `speed` fn as part of a
    // successful trip query
    const modeSwitch = this.modeSwitch();

    if (modeSwitch && modeSwitch.type === 'walking') {
      travelMode = '1';
    }

    const rule = this.tripPlanner.getRuleForModes([parseInt(travelMode, 10)]);
    const mode = rule ? this.tripPlanner.getTravelModeFromRule(rule) : undefined;

    // A mode the network cannot solve has no icon to show; its result is an error.
    if (!mode) {
      this.mode_icon = null;
      this.mode_header = '';
      return;
    }
    this.mode_icon = mode.directions_icon;
    this.mode_header = mode.directions_verb;
  }
}
