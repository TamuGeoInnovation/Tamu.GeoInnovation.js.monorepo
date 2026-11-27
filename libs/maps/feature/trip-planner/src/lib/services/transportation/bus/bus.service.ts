import { Injectable, InjectionToken, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, from, Observable, of, BehaviorSubject } from 'rxjs';
import { catchError, map, shareReplay, switchMap, take, tap } from 'rxjs/operators';

import { Angulartics2 } from 'angulartics2';

import {
  EsriMapService,
  MapServiceInstance,
  EsriModuleProviderService,
  PopupComponentReference
} from '@tamu-gisc/maps/esri';
import { escapeSqlString } from '@tamu-gisc/common/utils/database';

import { trackEvent } from '@tamu-gisc/common/ngx/analytics';

import esri = __esri;

/**
 * Optional Angular component rendered as the popup when a user clicks a bus stop (or route line) drawn
 * by the bus map. `BusService` lives in a low-level lib that cannot import the popup component directly
 * (it would create a circular dependency), so the concrete component is supplied at the application
 * root via this token. When not provided, bus features simply have no popup.
 */
export const BUS_STOP_POPUP_COMPONENT = new InjectionToken<PopupComponentReference>('BUS_STOP_POPUP_COMPONENT');

/**
 * The AggieSpirit bus stops and routes service: layer 0 is Bus Stops (multipoint), layer 1 Bus Routes (polyline, with
 * a uniqueValue renderer on `routenum` that supplies each route's color). AggieMap provides its own environment's from
 * `Connections.busRoutesUrl`, which this library cannot import; anything else reads production's (#2636).
 */
export const BUS_ROUTES_URL = new InjectionToken<string>('BUS_ROUTES_URL', {
  providedIn: 'root',
  factory: () => 'https://arc.ts.tamu.edu/arcgis/rest/services/Hosted/Bus_Routes_view/FeatureServer'
});

/**
 * The Bus Routes layer's `stop1`, `stop2`, ... field names in an answer's attributes, in stop order. How many there are
 * differs between the environments' services (#2636).
 */
export function routeStopFields(attributes: { [field: string]: unknown }): string[] {
  return Object.keys(attributes)
    .filter((field) => /^stop\d+$/.test(field))
    .sort((a, b) => Number(a.slice(4)) - Number(b.slice(4)));
}

@Injectable({ providedIn: 'root' })
export class BusService {
  private http = inject(HttpClient);
  private moduleProvider = inject(EsriModuleProviderService);
  private mapService = inject(EsriMapService);
  private readonly analytics = inject(Angulartics2);
  private busStopPopupComponent = inject<PopupComponentReference>(BUS_STOP_POPUP_COMPONENT, { optional: true });

  private serviceUrl = inject(BUS_ROUTES_URL);

  private _routes = null;

  private _map: esri.Map;

  private _busLayer: BehaviorSubject<esri.GraphicsLayer> = new BehaviorSubject(null);
  public busLayer: Observable<esri.GraphicsLayer> = this._busLayer.asObservable();

  private _busLayerGraphics: BehaviorSubject<esri.Graphic[]> = new BehaviorSubject([]);
  public busLayerGraphics: Observable<esri.Graphic[]> = this._busLayerGraphics.asObservable();

  constructor() {
    from(this.mapService.store).subscribe((mapInstance: MapServiceInstance) => {
      this._map = mapInstance.map;

      this.init();
    });
  }

  private init(): void {
    this.busMapLayer().subscribe((busLayer: esri.GraphicsLayer) => {
      this._busLayer.next(busLayer);

      // TODO: Probably have to dispose of this event handlers on service destroy.
      // Detect bus layer changes and set graphics as the service value.
      busLayer.graphics.on('change', () => {
        return this._busLayerGraphics.next(busLayer.graphics.toArray());
      });
    });
  }

  /**
   * Fetches the bus routes from the ArcGIS Bus Routes layer and caches the result for faster access
   * while the service remains alive.
   *
   * ArcGIS attributes are mapped into the legacy `TSRoute` shape so the existing UI works unchanged:
   * `routenum` -> `ShortName`, `routename` -> `Name`, renderer color -> `Color`, and `campus` -> group.
   */
  public getRoutes(): Observable<TSRoute[]> {
    if (this._routes != null) {
      return of(this._routes);
    }

    return forkJoin([
      this.arcgisQuery(1, {
        where: '1=1',
        outFields: 'routenum,routename,campus',
        returnGeometry: 'false'
      }),
      // Layer metadata, for the uniqueValue renderer that defines each route's color.
      this.http.get<ArcGISLayerInfo>(`${this.serviceUrl}/1?f=json`)
    ]).pipe(
      map((argument: [ArcGISQueryResponse, ArcGISLayerInfo]) => {
        const [query, layerInfo] = argument;
        const colors = this.buildRouteColorMap(layerInfo);
        const seen = new Set<string>();
        const routes: TSRoute[] = [];

        for (const feature of query.features || []) {
          const attributes = feature.attributes || {};
          const shortName = (attributes.routenum ?? '').toString().trim();

          // Skip blank route numbers and de-duplicate (the source has repeated routenum rows, e.g. `47/48`).
          if (shortName === '' || seen.has(shortName)) {
            continue;
          }
          seen.add(shortName);

          const onCampus = (attributes.campus ?? '').toString().trim().toLowerCase() === 'on';

          routes.push({
            Color: colors[shortName] || '#500000',
            Description: '',
            Group: {
              Name: onCampus ? 'On Campus' : 'Off Campus',
              Order: onCampus ? 0 : 1,
              IsGameDay: false
            },
            Icon: '',
            Key: shortName,
            Name: (attributes.routename ?? '').toString().trim() || shortName,
            ShortName: shortName
          });
        }

        return routes;
      }),
      tap((routes: TSRoute[]) => {
        if (routes.length > 0) {
          this._routes = routes;
        }
      }),
      catchError(() => {
        this.reportFailedRequest('Routes', '*');
        return of([] as TSRoute[]);
      }),
      shareReplay()
    );
  }

  public busMapLayer(): Observable<esri.Layer> {
    const id = 'bus-route-layer';
    let layer = <esri.GraphicsLayer>this._map.findLayerById(id);

    if (layer) {
      return of(layer);
    }

    return from(this.moduleProvider.require(['GraphicsLayer'])).pipe(
      switchMap(([GraphicsLayer]: [typeof esri.GraphicsLayer]) => {
        layer = new GraphicsLayer({
          id: id,
          title: 'Bus Routes',
          listMode: 'hide'
        });

        // Attach the popup component (if the app provided one) so clicking a stop/route graphic on this
        // layer is resolved to a rendered popup by the popup service (which reads `layer.popupComponent`).
        if (this.busStopPopupComponent) {
          (layer as unknown as { popupComponent: PopupComponentReference }).popupComponent = this.busStopPopupComponent;
        }

        this._map.add(layer);
        return of(layer);
      })
    );
  }

  public toggleMapRoute(short_name: string, symbols?: ('route' | 'stops')[], zoomToRoute = true): void {
    // Check if there are any existing graphics at all in the bus layer.
    const existingGraphics = this._busLayer.getValue().graphics.length > 0;

    // If there are any existing graphics in the bus layer, check if any belong to the provided short_name.
    // If there are any, this is a simple toggle to remove them.
    // If there are not any, this is a graphic addition for features that don't exist in the layer.

    const existingGraphicsForToggledRouteName = existingGraphics
      ? this._busLayer.getValue().graphics.some((graphic) => graphic.attributes.id === short_name)
      : existingGraphics;

    if (existingGraphics && existingGraphicsForToggledRouteName) {
      this.removeAllFromMap();
      return;
    }

    forkJoin([
      this.getRoutes(),
      this.routeGeometry(short_name),
      this.routeStops(short_name),
      this.moduleProvider.require(['Graphic', 'SimpleLineSymbol', 'SimpleMarkerSymbol', 'Polyline'])
    ]).subscribe(
      (
        argument: [
          TSRoute[],
          number[][][],
          MapStop[],
          [typeof esri.Graphic, typeof esri.SimpleLineSymbol, typeof esri.SimpleMarkerSymbol, typeof esri.Polyline]
        ]
      ) => {
        const [routes, paths, stops, [Graphic, SimpleLineSymbol, SimpleMarkerSymbol, Polyline]] = argument;

        this.removeAllFromMap();

        const route = routes.find((r) => r.ShortName === short_name);

        // A route's colour is `rgb(...)`, built from the Bus Routes layer's renderer, or the maroon default;
        // ArcGIS takes either as written.
        const color = route ? route.Color : '#500000';

        const stopGraphics = stops.map((stop) => {
          return new Graphic({
            geometry: {
              type: 'point',
              longitude: stop.longitude,
              latitude: stop.latitude
            },
            attributes: {
              id: short_name,
              type: 'waypoints',
              objectid: stop.objectId,
              stopname: stop.name,
              route: stop.routes,
              stoptype: stop.stopType,
              stopclass: stop.stopClass
            },
            symbol: new SimpleMarkerSymbol({
              style: stop.timed ? 'square' : 'circle',
              color: color,
              outline: {
                color: 'white',
                width: 1
              }
            })
          });
        });

        const route_graphic = new Graphic({
          geometry: new Polyline({
            paths: paths,
            spatialReference: { wkid: 4326 }
          }),
          attributes: {
            id: short_name,
            type: 'route',
            routeName: route ? route.Name : short_name
          },
          symbol: new SimpleLineSymbol({
            color: color,
            width: 3
          })
        });

        if ((symbols == null || symbols.indexOf('route') !== -1) && paths.length > 0) {
          this._busLayer.getValue().add(route_graphic);

          // Zoom to bus line geometry when added, unless the caller wants to preserve the current
          // extent (e.g. a shared bus-stop deep-link that has already zoomed to the stop). Clear of the side
          // panel, which a long route's far end finished behind (#2763).
          if (zoomToRoute) {
            this.mapService.store.pipe(take(1)).subscribe(() => this.mapService.fit(route_graphic));
          }
        }

        if (symbols == null || symbols.indexOf('stops') !== -1) {
          this._busLayer.getValue().addMany(stopGraphics);
        }
      }
    );
  }

  /**
   * Returns the ordered list of stop names for a route, sourced from the denormalized `stop1`, `stop2`, ...
   * fields on the Bus Routes layer. Used to populate the route detail panel.
   *
   * The number of those fields is read from the answer, not assumed: production's view has `stop32`, which route 47
   * uses, and development's stops at `stop31`, so naming either count would drop a stop or fail the query (#2636).
   */
  public getRouteStops(short_name: string): Observable<string[]> {
    return this.arcgisQuery(1, {
      where: `routenum='${escapeSqlString(short_name)}'`,
      outFields: '*',
      returnGeometry: 'false'
    }).pipe(
      map((response: ArcGISQueryResponse) => {
        const feature = response.features && response.features[0];

        if (!feature) {
          return [];
        }

        return routeStopFields(feature.attributes)
          .map((field) => feature.attributes[field])
          .filter((value): value is string | number => value != null && value.toString().trim() !== '')
          .map((value) => value.toString().trim());
      }),
      catchError(() => of([] as string[]))
    );
  }

  /**
   * Fetches the polyline path(s) for a route from the Bus Routes layer, in WGS84.
   */
  private routeGeometry(short_name: string): Observable<number[][][]> {
    return this.arcgisQuery(1, {
      where: `routenum='${escapeSqlString(short_name)}'`,
      outFields: 'routenum',
      returnGeometry: 'true',
      outSR: '4326'
    }).pipe(
      map((response: ArcGISQueryResponse) => {
        const paths: number[][][] = [];

        for (const feature of response.features || []) {
          if (feature.geometry && feature.geometry.paths) {
            paths.push(...feature.geometry.paths);
          }
        }

        return paths;
      }),
      catchError(() => {
        this.reportFailedRequest('Route Geometry', short_name);
        return of([] as number[][][]);
      })
    );
  }

  /**
   * Fetches the stops that serve a route from the Bus Stops layer, in WGS84.
   *
   * The `route` field is a comma-separated list (e.g. `05, 08, 35`), so the `LIKE` pre-filter is narrowed
   * with an exact token match to avoid false positives (e.g. `05` matching `NW0305`).
   */
  private routeStops(short_name: string): Observable<MapStop[]> {
    return this.arcgisQuery(0, {
      where: `route LIKE '%${escapeSqlString(short_name)}%'`,
      outFields: 'objectid,stopname,route,stoptype,stopclass',
      returnGeometry: 'true',
      outSR: '4326'
    }).pipe(
      map((response: ArcGISQueryResponse) => {
        const stops: MapStop[] = [];

        for (const feature of response.features || []) {
          const routes = (feature.attributes.route ?? '').toString().trim();
          const routeTokens = routes.split(',').map((token) => token.trim());

          if (routeTokens.indexOf(short_name) === -1) {
            continue;
          }

          const stopType = (feature.attributes.stoptype ?? '').toString().trim();
          const timed = stopType.toLowerCase() === 'time';
          const points = (feature.geometry && feature.geometry.points) || [];

          for (const point of points) {
            stops.push({
              longitude: point[0],
              latitude: point[1],
              timed: timed,
              objectId: Number(feature.attributes.objectid),
              name: (feature.attributes.stopname ?? '').toString().trim(),
              routes: routes,
              stopType: stopType,
              stopClass: (feature.attributes.stopclass ?? '').toString().trim()
            });
          }
        }

        return stops;
      }),
      catchError(() => {
        this.reportFailedRequest('Stops', short_name);
        return of([] as MapStop[]);
      })
    );
  }

  /**
   * Issues a query against a layer of the bus routes service, returning the parsed JSON.
   */
  private arcgisQuery(layerId: number, params: { [key: string]: string }): Observable<ArcGISQueryResponse> {
    const query = Object.entries({ f: 'json', ...params })
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');

    return this.http.get<ArcGISQueryResponse>(`${this.serviceUrl}/${layerId}/query?${query}`);
  }

  /**
   * Builds a `routenum -> css color` map from the Bus Routes layer's uniqueValue renderer.
   */
  private buildRouteColorMap(layerInfo: ArcGISLayerInfo): { [routeNum: string]: string } {
    const colors: { [routeNum: string]: string } = {};
    const infos = layerInfo?.drawingInfo?.renderer?.uniqueValueInfos || [];

    for (const info of infos) {
      const color = info.symbol && info.symbol.color;

      if (info.value != null && Array.isArray(color) && color.length >= 3) {
        colors[info.value.toString().trim()] = `rgb(${color[0]},${color[1]},${color[2]})`;
      }
    }

    return colors;
  }

  /**
   * Removes all routes, waypoints, and bus markers from the map for any drawn route(s).
   */
  public removeAllFromMap() {
    this._busLayer.getValue().removeAll();
  }

  private reportFailedRequest(type: string, route: string) {
    const label = {
      name: `${type}|${route}`
    };

    trackEvent(this.analytics, 'bus_fail', 'network_request', label);
  }
}

/**
 * Transportation Services response as JSON (from XML?)
 *
 * @interface TSRoute
 */
export interface TSRoute {
  /**
   * CSS RGB color string.
   *
   * Example: `rgb(0,84,166)`
   */
  Color: string;

  /**
   * JSON string with, from what I can tell, redundant information already in the object.
   */
  Description: string;

  Group: TSRouteGroup;

  Icon: string;

  Key: string;

  /**
   * Bus route name.
   *
   * Example: `Elephant walk`
   */
  Name: string;

  /**
   * Bus route number
   *
   * Example: `31`
   */
  ShortName: string;
}

/**
 * Details for the containing bus group.
 *
 * @export
 * @interface TSRouteGroup
 */
export interface TSRouteGroup {
  /**
   * Specifies if the containing bus group is used on game day.
   */
  IsGameDay: boolean;

  /**
   * Containing bus group name.
   */
  Name: string;

  /**
   * Specifies display order of containing bus group.
   */
  Order: number;
}

/**
 * Minimal shape of an ArcGIS REST `query` response used by the bus map.
 */
interface ArcGISQueryResponse {
  features?: Array<{
    attributes: { [key: string]: string | number | null };
    geometry?: {
      paths?: number[][][];
      points?: number[][];
    };
  }>;
}

/**
 * Minimal shape of an ArcGIS layer metadata response, for the uniqueValue renderer colors.
 */
interface ArcGISLayerInfo {
  drawingInfo?: {
    renderer?: {
      uniqueValueInfos?: Array<{
        value: string | number;
        symbol?: {
          color?: number[];
        };
      }>;
    };
  };
}

/**
 * A bus stop reduced to what the map needs: a WGS84 location, display attributes, and whether it is a
 * timed stop.
 */
interface MapStop {
  longitude: number;
  latitude: number;
  timed: boolean;
  objectId: number;
  name: string;
  routes: string;
  stopType: string;
  stopClass: string;
}
