import { Component } from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';
import { Angulartics2 } from 'angulartics2';

import { BasePopupComponent } from '../base/base.popup.component';
import { TripPlannerService } from '../../../../services/trip-planner/trip-planner.service';
import { EsriMapService } from '@tamu-gisc/maps/esri';

@Component({
  selector: 'parking-lot-popup-component',
  templateUrl: './parking-lot.component.html',
  styleUrls: ['../../containers/base/base.component.scss']
})
export class ParkingLotPopupComponent extends BasePopupComponent {
  constructor(
    private rtr: Router,
    private rt: ActivatedRoute,
    private ps: TripPlannerService,
    private anl: Angulartics2,
    private mp: EsriMapService
  ) {
    super(rtr, rt, ps, anl, mp);
  }

  public startDirections() {
    super.startDirections(`Lot ${this.data.attributes.Name}`);
  }
}
