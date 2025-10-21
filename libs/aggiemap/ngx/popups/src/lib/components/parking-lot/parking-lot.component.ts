import { Component } from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';
import { Angulartics2 } from 'angulartics2';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { EsriMapService } from '@tamu-gisc/maps/esri';
import { TripPlannerService } from '@tamu-gisc/maps/feature/trip-planner';

import { BaseDirectionsComponent } from '../base-directions/base-directions.component';

@Component({
  selector: 'tamu-gisc-parking-lot-popup-component',
  templateUrl: './parking-lot.component.html',
  styleUrls: ['../base/base.popup.component.scss']
})
export class ParkingLotPopupComponent extends BaseDirectionsComponent {
  constructor(
    private rtr: Router,
    private rt: ActivatedRoute,
    private ps: TripPlannerService,
    private anl: Angulartics2,
    private mp: EsriMapService,
    private env: EnvironmentService
  ) {
    super(rtr, rt, ps, anl, mp, env);
  }

  public startDirections() {
    super.startDirections(`Lot ${this.data.attributes.Name}`);
  }
}
