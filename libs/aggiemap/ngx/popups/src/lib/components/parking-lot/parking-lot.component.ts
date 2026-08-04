import { Component } from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';
import { Angulartics2 } from 'angulartics2';

import { EsriMapService } from '@tamu-gisc/maps/esri';
import { TripPlannerService } from '@tamu-gisc/maps/feature/trip-planner';

import { BaseDirectionsComponent } from '../base-directions/base-directions.component';

@Component({
  selector: 'tamu-gisc-parking-lot-popup-component',
  templateUrl: './parking-lot.component.html',
  styleUrls: ['../base/base.popup.component.scss']
})
export class ParkingLotPopupComponent extends BaseDirectionsComponent {
  private get lotIdentifier(): string | number | null {
    const identifiers = [this.data?.attributes?.LotName, this.data?.attributes?.Name];

    const identifier = identifiers.find((value) => {
      if (typeof value === 'string') {
        return value.trim().length > 0;
      }

      return value !== null && value !== undefined;
    });

    return identifier ?? null;
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

  protected override _getShareUrlFragment(): string | null {
    const identifier = this.lotIdentifier;

    return identifier !== null ? this._buildShareUrlFragment('parking-lot', identifier) : null;
  }

  public override startDirections() {
    super.startDirections(`Lot ${this.lotIdentifier ?? this.data.attributes.OBJECTID}`);
  }
}
