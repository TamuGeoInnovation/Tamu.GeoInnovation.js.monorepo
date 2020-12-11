import { Component } from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';
import { Angulartics2 } from 'angulartics2';

import { TripPlannerService } from '@tamu-gisc/maps/feature/trip-planner';
import { EsriMapService } from '@tamu-gisc/maps/esri';

import { BaseDirectionsComponent } from '../base-directions/base-directions.component';

@Component({
  selector: 'tamu-gisc-accessible-popup-component',
  templateUrl: './accessible.component.html',
  styleUrls: ['../base/base.popup.component.scss']
})
export class AccessiblePopupComponent extends BaseDirectionsComponent {
  constructor(
    private rtr: Router,
    private rt: ActivatedRoute,
    private ps: TripPlannerService,
    private anl: Angulartics2,
    private mp: EsriMapService
  ) {
    super(rtr, rt, ps, anl, mp);
  }
}
