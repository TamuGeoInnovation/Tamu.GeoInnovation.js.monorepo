import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { Angulartics2 } from 'angulartics2';
import * as guid from 'uuid/v4';

import { EsriMapService } from '@tamu-gisc/maps/esri';
import { TripPlannerService } from '@tamu-gisc/maps/feature/trip-planner';

import { GeneralDirectionsPopupComponent } from '../base/base.popup.component';

@Component({
  selector: 'tamu-gisc-buildling-popup-component',
  templateUrl: './building-popup.component.html',
  styleUrls: ['../base/base.popup.component.scss']
})
export class BuildingPopupComponent extends GeneralDirectionsPopupComponent {
  constructor(
    private rtr: Router,
    private rt: ActivatedRoute,
    private ps: TripPlannerService,
    private anl: Angulartics2,
    private ms: EsriMapService
  ) {
    super(rtr, rt, ps, anl, ms);
  }

  public startDirections() {
    super.startDirections(
      `${this.data.attributes.Number}|${
        this.data.attributes.BldgAbbr ? this.data.attributes.BldgAbbr : this.data.attributes.Abbrev
      }`
    );
  }

  public buildingProctorClick() {
    const label = {
      guid: guid(),
      date: Date.now(),
      value: {
        number: this.data.attributes.Number,
        abbreviation: this.data.attributes.BldgAbbr ? this.data.attributes.BldgAbbr : this.data.attributes.Abbrev
      }
    };

    this.anl.eventTrack.next({
      action: 'Building Proctor',
      properties: {
        category: 'UI Interaction',
        label: JSON.stringify(label)
      }
    });
  }
}
