import { Component, ChangeDetectionStrategy, inject } from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';
import { Angulartics2 } from 'angulartics2';

import { EsriMapService } from '@tamu-gisc/maps/esri';
import { TripPlannerService } from '@tamu-gisc/maps/feature/trip-planner';

import { BaseDirectionsComponent } from '../base-directions/base-directions.component';

@Component({
  selector: 'tamu-gisc-parking-kiosk-popup-component',
  templateUrl: './parking-kiosk.component.html',
  styleUrls: ['../base/base.popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager
})
export class ParkingKioskPopupComponent extends BaseDirectionsComponent {
  private rtr: Router;
  private rt: ActivatedRoute;
  private ps: TripPlannerService;
  private anl: Angulartics2;
  private mp: EsriMapService;

  constructor() {
    const rtr = inject(Router);
    const rt = inject(ActivatedRoute);
    const ps = inject(TripPlannerService);
    const anl = inject(Angulartics2);
    const mp = inject(EsriMapService);

    super(rtr, rt, ps, anl, mp);
  
    this.rtr = rtr;
    this.rt = rt;
    this.ps = ps;
    this.anl = anl;
    this.mp = mp;
  }

  public startDirections() {
    super.startDirections(`ObjectID ${this.data.attributes.OBJECTID}`);
  }
}
