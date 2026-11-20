import { Component } from '@angular/core';

import { TripPlannerDirectionsComponent } from '../base/base.component';
import { TripPlannerDirectionsActionsMobileComponent } from '../../../trip-planner-directions-actions/containers/mobile/mobile.component';
import { TripPlannerModeSwitchComponent } from '../../../trip-planner-mode-switch/containers/base/base.component';
import { TripPlannerShadeSummaryComponent } from '../../../trip-planner-shade-summary/trip-planner-shade-summary.component';

@Component({
  selector: 'tamu-gisc-trip-planner-directions-mobile',
  templateUrl: './mobile.component.html',
  styleUrls: ['../base/base.component.scss', './mobile.component.scss'],
  imports: [TripPlannerDirectionsActionsMobileComponent, TripPlannerModeSwitchComponent, TripPlannerShadeSummaryComponent]
})
export class TripPlannerDirectionsMobileComponent extends TripPlannerDirectionsComponent {}
