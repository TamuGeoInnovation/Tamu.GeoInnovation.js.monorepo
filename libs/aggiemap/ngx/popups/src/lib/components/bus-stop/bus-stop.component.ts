import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { filter, take } from 'rxjs/operators';

import { Angulartics2 } from 'angulartics2';

import { EsriMapService } from '@tamu-gisc/maps/esri';
import { BusService, TripPlannerService } from '@tamu-gisc/maps/feature/trip-planner';

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
export class BusStopPopupComponent extends BaseDirectionsComponent implements OnInit {
  /**
   * Transportation Services bus schedules — the AggieSpirit per-stop schedule page requires a stopCode
   * and directionName that the TS/Bus_Routes source does not provide, so this links to the general page.
   */
  public readonly transportUrl = 'https://transport.tamu.edu/busroutes/?utm_source=aggiemap';

  /**
   * Router path of the desktop bus map. The share link targets this — rather than the site root —
   * so an opened `?busstop=` link lands on the bus route-list panel instead of the default map's
   * Layers panel. The app's base href is `/` and `map` is a route segment, so this resolves on both
   * localhost and prod; the `DesktopGuard` rewrites `d`→`m` (preserving the query param) for mobile.
   */
  private readonly busMapPath = 'map/d/bus';

  constructor(
    private rtr: Router,
    private rt: ActivatedRoute,
    private ps: TripPlannerService,
    private anl: Angulartics2,
    private mp: EsriMapService,
    private busService: BusService
  ) {
    super(rtr, rt, ps, anl, mp);
  }

  public override ngOnInit(): void {
    super.ngOnInit();
    this.drawServingRouteForDeepLink();
  }

  /**
   * Deep-link fragment for the copy-link, composed from the `bus-stops-exact` search source's
   * configured `urlQueryParam` (`?busstop=<OBJECTID>`) and prefixed with the bus map path so the
   * shared link opens on the bus map. Returns null when there is no stop OBJECTID (e.g. the route
   * line), which leaves the share URL as the site origin.
   */
  protected override _getShareUrlFragment(): string | null {
    const objectId = this.data?.attributes?.OBJECTID;

    if (objectId == null) {
      return null;
    }

    const queryFragment = this._buildShareUrlFragment('bus-stops-exact', objectId);

    return queryFragment ? `${this.busMapPath}${queryFragment}` : null;
  }

  /**
   * When opened from a shared `?busstop=` deep-link, the route serving the stop is not on the map yet
   * (client-drawn stop graphics carry a `type` attribute; a deep-link-resolved feature does not). Draw
   * the first serving route for context — waiting for the bus layer to exist and preserving the stop's
   * zoom (`zoomToRoute: false`).
   */
  private drawServingRouteForDeepLink(): void {
    const attributes = this.data?.attributes;

    // Only for deep-link-resolved stops. Click-path stops (`type: 'waypoints'`) and the route line
    // (`type: 'route'`) already have their route drawn.
    if (!attributes || attributes.type !== undefined) {
      return;
    }

    const firstRoute = (attributes.Route ?? '').toString().split(',')[0].trim();

    if (!firstRoute) {
      return;
    }

    this.busService.busLayer
      .pipe(
        filter((layer) => layer !== null),
        take(1)
      )
      .subscribe(() => {
        this.busService.toggleMapRoute(firstRoute, undefined, false);
      });
  }
}
