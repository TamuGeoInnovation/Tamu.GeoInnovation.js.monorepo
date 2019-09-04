import { Component } from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';
import { Angulartics2 } from 'angulartics2';

import { BasePopupComponent } from '../base/base.popup.component';
import { TripPlannerService } from '../../../../services/trip-planner/trip-planner.service';
import { EsriMapService } from '@tamu-gisc/maps/esri';

@Component({
  selector: 'construction-popup-component',
  templateUrl: './construction.component.html',
  styleUrls: ['../../containers/base/base.component.scss']
})
export class ConstructionPopupComponent extends BasePopupComponent {
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
