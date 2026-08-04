import { Component, OnInit } from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';
import { Angulartics2 } from 'angulartics2';

import { EsriMapService } from '@tamu-gisc/maps/esri';
import { TripPlannerService } from '@tamu-gisc/maps/feature/trip-planner';

import { BaseDirectionsComponent } from '../base-directions/base-directions.component';

@Component({
  selector: 'tamu-gisc-construction-popup-component',
  templateUrl: './construction.component.html',
  styleUrls: ['../base/base.popup.component.scss']
})
export class ConstructionPopupComponent extends BaseDirectionsComponent implements OnInit {
  public showContactName = false;
  public showContactInfo = false;

  constructor(
    private rtr: Router,
    private rt: ActivatedRoute,
    private ps: TripPlannerService,
    private anl: Angulartics2,
    private mp: EsriMapService
  ) {
    super(rtr, rt, ps, anl, mp);
  }

  public override ngOnInit(): void {
    super.ngOnInit();

    // Determine if the contact name and info should be shown based valid attribute data (not null or empty)
    this.showContactName = this.data.attributes.ContactName && this.data.attributes.ContactName.trim() !== '';
    this.showContactInfo = this.data.attributes.ContactInfo && this.data.attributes.ContactInfo.trim() !== '';
  }
}
