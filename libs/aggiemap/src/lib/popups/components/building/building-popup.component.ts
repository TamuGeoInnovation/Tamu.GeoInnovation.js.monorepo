import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { Angulartics2 } from 'angulartics2';
import { v4 as guid } from 'uuid';

import { EsriMapService } from '@tamu-gisc/maps/esri';
import { TripPlannerService } from '@tamu-gisc/maps/feature/trip-planner';

import { BaseDirectionsComponent } from '../base-directions/base-directions.component';

@Component({
  selector: 'tamu-gisc-buildling-popup-component',
  templateUrl: './building-popup.component.html',
  styleUrls: ['../base/base.popup.component.scss']
})
export class BuildingPopupComponent extends BaseDirectionsComponent implements OnInit {
  public proctorURL: string;

  constructor(
    private rtr: Router,
    private rt: ActivatedRoute,
    private ps: TripPlannerService,
    private anl: Angulartics2,
    private ms: EsriMapService
  ) {
    super(rtr, rt, ps, anl, ms);
  }

  public ngOnInit() {
    super.ngOnInit();

    const buildingNumber = this.data.attributes.Number.split('.')[0];

    this.proctorURL = `https://proctorlist.tamu.edu/MainProctorBuildings/Details/${buildingNumber}?utm_source=aggiemap`;
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
