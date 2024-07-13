import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Angulartics2 } from 'angulartics2';

import { EsriMapService } from '@tamu-gisc/maps/esri';
import { BaseDirectionsComponent } from '@tamu-gisc/aggiemap/ngx/popups';
import { TripPlannerService } from '@tamu-gisc/maps/feature/trip-planner';

import { MoveinOutServiceService } from '../../map/services/move-in-out-service.service';

@Component({
  selector: 'tamu-gisc-move-in-out-parking-space',
  templateUrl: './move-in-out-parking-space-popup.component.html',
  styleUrls: ['./move-in-out-parking-space-popup.component.scss']
})
export class MoveInOutParkingSpacePopupComponent extends BaseDirectionsComponent implements OnInit {
  /**
   * From the movein parking lots table,
   */
  public lotName: string;

  public lotParkingType: string | undefined;

  constructor(
    private readonly rrt: Router,
    private readonly rtt: ActivatedRoute,
    private readonly pss: TripPlannerService,
    private readonly agl: Angulartics2,
    private readonly ems: EsriMapService,
    private readonly mss: MoveinOutServiceService
  ) {
    super(rrt, rtt, pss, agl, ems);
  }

  public override ngOnInit() {
    super.ngOnInit();

    const daySuffix = this.mss.getMoveDateEventDayNumberForSettings();

    if (daySuffix !== undefined) {
      this.lotParkingType = this.data.attributes[`Day_${daySuffix}`];
    }
  }
}
