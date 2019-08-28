import { Component } from '@angular/core';
import { TripPlannerService } from '../../../../../services/trip-planner/trip-planner.service';

@Component({
  selector: 'trip-planner-mode-picker',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss']
})
export class TripPlannerModePickerComponent {
  constructor(private plannerService: TripPlannerService) {}
  /**
   * Calls the trip planner service and sets accessible travel mode based on the provided value
   *
   * @param {value} value `true` to set accessible routing mode, `false` to disable it
   * @memberof TripPlannerModePickerComponent
   */
  public set accessibleTravel(value: boolean) {
    this.plannerService.updateTravelOptions({ accessible: value });
  }
}
