import { Component, OnInit } from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';
import { Angulartics2 } from 'angulartics2';

import { EsriMapService } from '@tamu-gisc/maps/esri';
import { TripPlannerService } from '@tamu-gisc/maps/feature/trip-planner';

import { BaseDirectionsComponent } from '../base-directions/base-directions.component';

@Component({
  selector: 'tamu-gisc-poi-popup-component',
  templateUrl: './poi.component.html',
  styleUrls: ['../base/base.popup.component.scss']
})
export class PoiPopupComponent extends BaseDirectionsComponent implements OnInit {
  public medias: Array<string> = [];

  public settings = {
    counter: false
  };

  constructor(
    private rtr: Router,
    private rt: ActivatedRoute,
    private ps: TripPlannerService,
    private anl: Angulartics2,
    private mp: EsriMapService
  ) {
    super(rtr, rt, ps, anl, mp);
  }

  public ngOnInit(): void {
    super.ngOnInit();

    this.medias = this.data.attributes.images.split(',').map((imgName) => {
      return `https://aggiemap.tamu.edu/images/cb/${imgName}`;
    });
  }

  public startDirections() {
    super.startDirections(`${this.data.attributes.Name}`);
  }
}

