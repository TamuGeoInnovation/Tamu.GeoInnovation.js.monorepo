import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { Angulartics2 } from 'angulartics2';

import { EsriMapService } from '@tamu-gisc/maps/esri';
import { TripPlannerService } from '@tamu-gisc/maps/feature/trip-planner';

import { BaseDirectionsComponent } from '../base-directions/base-directions.component';

/**
 * Popup for the AggieSpirit bus map. Rendered when a user clicks a graphic drawn by `BusService` on the
 * `bus-route-layer` — either a bus stop (`type !== 'route'`) or the route line (`type === 'route'`) —
 * or when a shared `?busstop=<OBJECTID>` deep-link resolves a stop feature.
 *
 * Extends `BaseDirectionsComponent` for the shared "Directions To Here" + copy-link behavior.
 */
@Component({
  selector: 'tamu-gisc-bus-stop-popup-component',
  templateUrl: './bus-stop.component.html',
  styleUrls: ['../base/base.popup.component.scss']
})
export class BusStopPopupComponent extends BaseDirectionsComponent {
  /**
   * Transportation Services bus schedules — the AggieSpirit per-stop schedule page requires a stopCode
   * and directionName that the TS/Bus_Routes source does not provide, so this links to the general page.
   */
  public readonly transportUrl = 'https://transport.tamu.edu/busroutes/?utm_source=aggiemap';

  constructor(
    private rtr: Router,
    private rt: ActivatedRoute,
    private ps: TripPlannerService,
    private anl: Angulartics2,
    private mp: EsriMapService
  ) {
    super(rtr, rt, ps, anl, mp);
  }

  /**
   * Deep-link fragment for the copy-link, composed from the `bus-stops-exact` search source's
   * configured `urlQueryParam` (`?busstop=<OBJECTID>`). Returns null when there is no stop OBJECTID
   * (e.g. the route line), which leaves the share URL as the site origin.
   */
  protected override _getShareUrlFragment(): string | null {
    const objectId = this.data?.attributes?.OBJECTID;

    return objectId != null ? this._buildShareUrlFragment('bus-stops-exact', objectId) : null;
  }
}
