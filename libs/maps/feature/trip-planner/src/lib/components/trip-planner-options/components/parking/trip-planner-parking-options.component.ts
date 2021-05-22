import { Component } from '@angular/core';

import { Angulartics2 } from 'angulartics2';

import { TestingService } from '@tamu-gisc/dev-tools/application-testing';

import { ParkingService } from '../../../../services/transportation/drive/parking.service';
import { TripPlannerOptionsBaseComponent } from '../base/base.component';
import { TripPlannerService } from '../../../../services/trip-planner.service';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-trip-planner-parking-options-component',
  templateUrl: './trip-planner-parking-options.component.html',
  styleUrls: ['../../containers/base/base.component.scss']
})
export class TripPlannerParkingOptionsComponent extends TripPlannerOptionsBaseComponent {
  /**
   * Retrieves parking features (decks and lots) from parking service and filters by feature name
   * filtering out any which are empty and duplicates.
   */
  public parkingFeatures = this.parking.getParkingPermits();

  constructor(
    private analytics: Angulartics2,
    private tp: TripPlannerService,
    private dts: TestingService,
    private parking: ParkingService<esri.Graphic>
  ) {
    super(analytics, tp, dts);
  }
}
