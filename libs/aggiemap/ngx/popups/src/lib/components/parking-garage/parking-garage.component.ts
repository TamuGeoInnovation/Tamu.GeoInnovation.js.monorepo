import { Component, ChangeDetectionStrategy } from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';
import { Angulartics2 } from 'angulartics2';

import { EsriMapService } from '@tamu-gisc/maps/esri';
import { TripPlannerService } from '@tamu-gisc/maps/feature/trip-planner';

import { BaseDirectionsComponent } from '../base-directions/base-directions.component';
import { CopyComponent } from '@tamu-gisc/ui-kits/ngx/interactions/clipboard';
import { AsyncPipe } from '@angular/common';

/**
 * Details for a parking garage (#1163).
 *
 * Garages carry lot fields (`LotName`, `Name`, `FAC_CODE`), not building fields, so the building popup
 * they used to open rendered empty. They share the parking lot popup's layout, but not its link:
 * garages are not in the parking lots layer, so a `?lot=` link could not find one. They link through
 * the garage search source instead.
 */
@Component({
    selector: 'tamu-gisc-parking-garage-popup-component',
    templateUrl: '../parking-lot/parking-lot.component.html',
    styleUrls: ['../base/base.popup.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [CopyComponent, AsyncPipe]
})
export class ParkingGaragePopupComponent extends BaseDirectionsComponent {
  /** The garage code (`CCG`) where there is one, else its name; the garage search source matches either. */
  private get garageIdentifier(): string | null {
    const identifier = [this.data?.attributes?.Name, this.data?.attributes?.LotName].find(
      (value) => typeof value === 'string' && value.trim().length > 0
    );

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
    const identifier = this.garageIdentifier;

    return identifier !== null ? this._buildShareUrlFragment('parking-garage', identifier) : null;
  }

  public startDirections() {
    super.startDirections(
      this.data?.attributes?.LotName ?? `Garage ${this.garageIdentifier ?? this.data?.attributes?.OBJECTID}`
    );
  }
}
