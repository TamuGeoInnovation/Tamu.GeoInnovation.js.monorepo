import { Component } from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';
import { Angulartics2 } from 'angulartics2';

import { BasePopupComponent } from '../base/base.popup.component';
import { TripPlannerService } from '../../../../services/trip-planner/trip-planner.service';
import { EsriMapService } from '@tamu-gisc/maps/esri';

@Component({
  selector: 'poi-popup-component',
  templateUrl: './poi.component.html',
  styleUrls: ['../../containers/base/base.component.scss']
})
export class PoiPopupComponent extends BasePopupComponent {
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
    super.startDirections(`${this.data.attributes.Name}`);
  }
}
