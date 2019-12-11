import { Component } from '@angular/core';

import { Angulartics2 } from 'angulartics2';

import { ParkingService } from '../../../../../services/transportation/drive/parking.service';
import { TripPlannerOptionsBaseComponent } from '../base/base.component';
import { TripPlannerService } from '../../../../../services/trip-planner/trip-planner.service';

@Component({
  selector: 'gisc-trip-planner-parking-options-component',
  templateUrl: './trip-planner-parking-options.component.html',
  styleUrls: ['../../containers/base/base.component.scss']
})
export class TripPlannerParkingOptionsComponent extends TripPlannerOptionsBaseComponent {
  /**
   * Retrieves parking features (decks and lots) from parking service and filters by feature name
   * filtering out any which are empty and duplicates.
   *
   * @memberof TripPlannerParkingOptionsComponent
   */
  public parkingFeatures = this.parking.getParkingPermits();

  constructor(private analytics: Angulartics2, private tp: TripPlannerService, private parking: ParkingService) {
    super(analytics, tp);
  }
}
