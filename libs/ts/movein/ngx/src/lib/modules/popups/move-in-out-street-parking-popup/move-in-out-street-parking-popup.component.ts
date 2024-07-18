import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Angulartics2 } from 'angulartics2';

import { BaseDirectionsComponent } from '@tamu-gisc/aggiemap/ngx/popups';
import { EsriMapService } from '@tamu-gisc/maps/esri';
import { TripPlannerService } from '@tamu-gisc/maps/feature/trip-planner';

@Component({
  selector: 'tamu-gisc-move-in-out-street-parking-popup',
  templateUrl: './move-in-out-street-parking-popup.component.html',
  styleUrls: ['./move-in-out-street-parking-popup.component.scss']
})
export class MoveInOutStreetParkingPopupComponent extends BaseDirectionsComponent {
  constructor(
    private rtr: Router,
    private rt: ActivatedRoute,
    private ps: TripPlannerService,
    private anl: Angulartics2,
    private mp: EsriMapService
  ) {
    super(rtr, rt, ps, anl, mp);
  }

  public override startDirections() {
    super.startDirections(`Lot ${this.data.attributes.A_Name}`);
  }
}

