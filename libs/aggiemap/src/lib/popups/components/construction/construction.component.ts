import { Component } from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';
import { Angulartics2 } from 'angulartics2';

import { EsriMapService } from '@tamu-gisc/maps/esri';
import { TripPlannerService } from '@tamu-gisc/maps/feature/trip-planner';

import { GeneralDirectionsPopupComponent } from '../base/base.popup.component';

@Component({
  selector: 'tamu-gisc-construction-popup-component',
  templateUrl: './construction.component.html',
  styleUrls: ['../base/base.popup.component.scss']
})
export class ConstructionPopupComponent extends GeneralDirectionsPopupComponent {
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
