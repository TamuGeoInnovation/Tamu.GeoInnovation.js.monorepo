import { Component, Input, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';

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
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [NgClass, TripPlannerBusModeSwitchComponent, RouteDirectionTransformerPipe]
})
export class TripPlannerModeSwitchComponent implements OnInit {
  private tripPlanner = inject(TripPlannerService);
  private busService = inject(BusService);

  @Input()
  public modeSwitch: TripModeSwitch = null;

  @Input()
  public result: TripResult;

  public mode_header = '';
  public mode_icon?: string = null;

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
    let travelMode = this.result.params.travelMode.id;

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
