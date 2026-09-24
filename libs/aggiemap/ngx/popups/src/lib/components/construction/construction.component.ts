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

  // Normalized attribute values. This popup is shared by construction layers backed by
  // different services with different field casing: the legacy TS_Main construction
  // sublayer uses PascalCase (Name, StartDate, ...) while the newer hosted
  // TSConstruction_Hosted service uses lowercase (name, startdate, ...). Reading through
  // these getters (case-insensitive) keeps a single popup component working for both.
  public get name(): string {
    return this.attribute('name');
  }

  public get startDate(): string {
    return this.attribute('startdate');
  }

  public get endDate(): string {
    return this.attribute('enddate');
  }

  public get contactName(): string {
    return this.attribute('contactname');
  }

  public get contactInfo(): string {
    return this.attribute('contactinfo');
  }

  public get notes(): string {
    return this.attribute('notes');
  }

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

    // Determine if the contact name and info should be shown based valid attribute data (not null or empty)
    this.showContactName = !!this.contactName && this.contactName.trim() !== '';
    this.showContactInfo = !!this.contactInfo && this.contactInfo.trim() !== '';
  }

  /**
   * Resolves an attribute value by name, case-insensitively, so this component can be reused
   * against services whose field names differ only in casing.
   */
  private attribute(lowerCaseFieldName: string): string {
    const attributes = this.data.attributes as Record<string, string>;
    const key = Object.keys(attributes).find((k) => k.toLowerCase() === lowerCaseFieldName);

    return key ? attributes[key] : undefined;
  }
}
