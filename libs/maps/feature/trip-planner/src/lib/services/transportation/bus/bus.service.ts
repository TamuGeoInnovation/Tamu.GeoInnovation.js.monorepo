import { Inject, Injectable, InjectionToken, Optional, Type } from '@angular/core';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { forkJoin, from, Observable, of, BehaviorSubject, timer } from 'rxjs';
import { catchError, map, shareReplay, switchMap, take, tap } from 'rxjs/operators';

import toHex from 'colornames';
import { v4 as guid } from 'uuid';
import { Angulartics2 } from 'angulartics2';

import { Point as LatLon } from '@tamu-gisc/common/types';
import { EsriMapService, MapServiceInstance, EsriModuleProviderService } from '@tamu-gisc/maps/esri';
import { dateForDateTimeString } from '@tamu-gisc/common/utils/date';
import { relativeDistance } from '@tamu-gisc/common/utils/geometry/generic';

import { TripModeSwitch } from '../../trip-planner.service';

import esri = __esri;

const ROUTE_NUMBER_REGEX = /on ([0-9\-A-Za-z]+)$/;

/**
 * Optional Angular component rendered as the popup when a user clicks a bus stop (or route line) drawn
 * by the bus map. `BusService` lives in a low-level lib that cannot import the popup component directly
 * (it would create a circular dependency), so the concrete component is supplied at the application
 * root via this token. When not provided, bus features simply have no popup.
 */
export const BUS_STOP_POPUP_COMPONENT = new InjectionToken<Type<unknown>>('BUS_STOP_POPUP_COMPONENT');

@Injectable({ providedIn: 'root' })
export class BusService {
  // Legacy Transportation Services API. It is no longer available; the methods still referencing it
  // (waypoints/stops/timetable/live-bus, used only by the currently-disabled trip-planner bus mode)
  // are kept for compilation but are not exercised by the bus map.
  private base_url = 'https://nodes.geoservices.tamu.edu/api/route';

  // AggieSpirit Bus Routes ArcGIS MapServer. Layer 0 = Bus Stops (multipoint), Layer 1 = Bus Routes
  // (polyline, with a uniqueValue renderer on RouteNum that supplies per-route colors).
  //
  // NOTE: TS/Bus_Routes is currently published only to the dev GIS host. It is pinned here (rather than
  // host-derived) so it also resolves on localhost — a host-from-hostname helper returns the prod host
  // for `localhost`, which 404s for this dev-only service. It will 404 on production until TS publishes
  // the service there; at that point switch this to the host-derived (prod) URL.
  // TODO: un-pin to `gis.it.tamu.edu` once TS/Bus_Routes is published to production.
  private serviceUrl = 'https://gis-dev.it.tamu.edu/arcgis/rest/services/TS/Bus_Routes/MapServer';

  private _routes = null;
  private stop_map = [];
  private timetable_map = [];
  private waypoint_map = [];

  private _map: esri.Map;
  private _view: esri.MapView | esri.SceneView;

  private _busLayer: BehaviorSubject<esri.GraphicsLayer> = new BehaviorSubject(null);
  public busLayer: Observable<esri.GraphicsLayer> = this._busLayer.asObservable();

  private _busLayerGraphics: BehaviorSubject<esri.Graphic[]> = new BehaviorSubject([]);
  public busLayerGraphics: Observable<esri.Graphic[]> = this._busLayerGraphics.asObservable();

  private _busLocationsLayer: esri.FeatureLayer;

  constructor(
    private http: HttpClient,
    private moduleProvider: EsriModuleProviderService,
    private mapService: EsriMapService,
    private location: Location,
    private readonly analytics: Angulartics2,
    @Optional() @Inject(BUS_STOP_POPUP_COMPONENT) private busStopPopupComponent: Type<unknown>
  ) {
    from(this.mapService.store).subscribe((mapInstance: MapServiceInstance) => {
      this._map = mapInstance.map;
      this._view = mapInstance.view;

      this.init();
    });
  }

  private init(): void {
    this.busMapLayer().subscribe((busLayer: esri.GraphicsLayer) => {
      this._busLayer.next(busLayer);

      // TODO: Probably have to dispose of this event handlers on service destroy.
      // Detect bus layer changes and set graphics as the service value.
      busLayer.graphics.on('change', (event: { target: esri.Collection<esri.Graphic> }) => {
        return this._busLayerGraphics.next(event.target.clone().toArray());
      });
    });
  }

  /**
   * Fetches the bus routes from the ArcGIS Bus Routes layer and caches the result for faster access
   * while the service remains alive.
   *
   * ArcGIS attributes are mapped into the legacy `TSRoute` shape so the existing UI works unchanged:
   * `RouteNum` -> `ShortName`, `RouteName` -> `Name`, renderer color -> `Color`, and `Campus` -> group.
   */
  public getRoutes(): Observable<TSRoute[]> {
    if (this._routes != null) {
      return of(this._routes);
    }

    return forkJoin([
      this.arcgisQuery(1, {
        where: '1=1',
        outFields: 'RouteNum,RouteName,Campus',
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
          const shortName = (attributes.RouteNum ?? '').toString().trim();

          // Skip blank route numbers and de-duplicate (the source has repeated RouteNum rows, e.g. `47/48`).
          if (shortName === '' || seen.has(shortName)) {
            continue;
          }
          seen.add(shortName);

          const onCampus = (attributes.Campus ?? '').toString().trim().toLowerCase() === 'on';

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
            Name: (attributes.RouteName ?? '').toString().trim() || shortName,
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

  public waypointsForRoute(short_name: string): Observable<Waypoint[]> {
    const waypoints_url = `${this.base_url}/${short_name}/route`;
    const matching_waypoints = this.waypoint_map.filter((el) => el.short_name === short_name);

    if (matching_waypoints.length > 0 && matching_waypoints[0].stops != null) {
      return of(matching_waypoints[0].waypoints);
    }

    return forkJoin([
      this.http.get(waypoints_url).pipe(
        catchError(() => {
          this.reportFailedRequest('Waypoints', short_name);

          return timer(1000).pipe(
            switchMap(() => {
              return this.http.get(waypoints_url);
            })
          );
        })
      ),
      this.moduleProvider.require(['Point', 'SpatialReference', 'webMercatorUtils'])
    ]).pipe(
      switchMap(
        (argument: [TSWaypoint[], [esri.PointConstructor, esri.SpatialReferenceConstructor, esri.webMercatorUtils]]) => {
          const [waypoints_raw, [Point, SpatialReference, webMercatorUtils]] = argument;
          const waypoints: Waypoint[] = [];
          for (const waypoint of waypoints_raw) {
            waypoints.push({
              name: waypoint.Name,
              point: <esri.Point>webMercatorUtils.webMercatorToGeographic(
                new Point({
                  y: waypoint.Latitude,
                  x: waypoint.Longtitude,
                  spatialReference: SpatialReference.WebMercator
                })
              ),
              stop: waypoint.Stop != null,
              timed_stop: waypoint.Stop != null ? waypoint.Stop.IsTimePoint : false
            });
          }
          this.waypoint_map.push({
            short_name: short_name,
            waypoints: waypoints
          });
          return of(waypoints);
        }
      )
    );
  }

  private stopsForRoute(short_name: string): Observable<BusStop[]> {
    const stops_url = `${this.base_url}/${short_name}/stops`;
    const matching_routes = this.stop_map.filter((el) => el.short_name === short_name);

    if (matching_routes.length > 0 && matching_routes[0].stops != null) {
      return of(matching_routes[0].stops);
    }

    return forkJoin([
      this.http.get(stops_url).pipe(
        catchError(() => {
          this.reportFailedRequest('Stops', short_name);

          return timer(1000).pipe(
            switchMap(() => {
              return this.http.get(stops_url);
            })
          );
        })
      ),
      this.moduleProvider.require(['Point', 'SpatialReference', 'webMercatorUtils'])
    ]).pipe(
      switchMap(
        (argument: [TSStopJson[], [esri.PointConstructor, esri.SpatialReferenceConstructor, esri.webMercatorUtils]]) => {
          const [stops_raw, [Point, SpatialReference, webMercatorUtils]] = argument;
          const stops: BusStop[] = [];
          for (const stop of stops_raw) {
            const stop_name = stop.Name;
            const point = webMercatorUtils.webMercatorToGeographic(
              new Point({
                y: stop.Latitude,
                x: stop.Longtitude,
                spatialReference: SpatialReference.WebMercator
              })
            );
            stops.push({
              name: stop_name,
              point: <esri.Point>point
            });
          }
          this.stop_map.push({
            short_name: short_name,
            stops: stops
          });
          return of(stops);
        }
      )
    );
  }

  public timetableForRoute(short_name: string): Observable<TimetableEntry[][]> {
    return this.timeTableForRouteOnDate(short_name, new Date());
  }

  private timeTableForRouteOnDate(short_name: string, date: Date): Observable<TimetableEntry[][]> {
    const date_string = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    const timetable_url = `${this.base_url}/${short_name}/timetable/${date_string}`;
    const matching_routes = this.timetable_map.filter((el) => el.short_name === short_name && el.date === date_string);
    if (matching_routes.length > 0) {
      of(matching_routes[0].timetable);
    }
    return this.http.get(timetable_url).pipe(
      catchError(() => {
        this.reportFailedRequest(`Date Timetable;${date_string}`, short_name);

        return timer(1000).pipe(
          switchMap(() => {
            return this.http.get(timetable_url);
          })
        );
      }),
      switchMap((timetable_raw: TSTimetable[]) => {
        const timetable: TimetableEntry[][] = [];
        for (const timetable_row_json of timetable_raw) {
          const row: TimetableEntry[] = [];
          for (const key of Object.keys(timetable_row_json)) {
            const time = timetable_row_json[key];
            row.push({
              stop_name: key.substr(36), // First 36 characters are the UUID, for some reason
              time: time,
              datetime: time == null ? null : dateForDateTimeString(time, date)
            });
          }
          timetable.push(row);
        }
        this.stop_map.push({
          short_name: short_name,
          date: date_string,
          stops: timetable
        });
        return of(timetable);
      })
    );
  }

  private getStopAtPoint(stops: BusStop[], point: number[]): BusStopWithIndex {
    const esriPoint: LatLon = {
      latitude: point[1],
      longitude: point[0]
    };

    const distances = relativeDistance(
      esriPoint,
      stops.map((s) => {
        return {
          geometry: s.point
        };
      })
    );

    const min = Math.min(...distances);

    const minIndex = distances.indexOf(min);

    return {
      index: minIndex,
      stop: stops[minIndex]
    };
  }

  private generateTimetable(
    route_name: string,
    first: BusStopWithIndex,
    last: BusStopWithIndex,
    minDate: Date
  ): Observable<TimetableWithLinger> {
    return forkJoin([this.timeTableForRouteOnDate(route_name, minDate), this.stopsForRoute(route_name)]).pipe(
      switchMap((argument: [TimetableEntry[][], BusStop[]]) => {
        const [timetable, stops] = argument;

        // Set the max filtering range. Do not process time table rows that are n hours ahead of current date.
        const maxDate = new Date(minDate);
        maxDate.setHours(maxDate.getHours() + 1);

        // Condition for no bus service on requested date, if time table has no rows.
        if (timetable.length === 1 && timetable[0].length === 1) {
          return of({
            timetable: [],
            linger_minutes: 0
          });
        }

        // Placeholder where time table rows will be inserted as they are generated.
        const generated_timetable: TimetableRow[] = [];

        // Determining the matching time-table records from the provided departure/arrival bus stops.
        //
        // Assumptions:
        //
        // - Time table first and last checkpoints are always the same and are always found in the
        //   full bus stop list (these don't have associated times. They are just geographic points.). The timetable
        //   only has the major stops, while the complete bus stop list has major stops AND waypoints.
        //
        // - Major stops have scheduled arrival and departure times. Waypoint times need to be estimated.
        //
        // - Additional processing is needed when the user departure or arrival stop is not one included in the timetable.
        //
        // If the start point is not in the time table, determine the matching bus stop bracket for which the selected stop must be within
        // and estimate the estimated travel time as a function of the time difference of the time bracket and the index of the selected
        // bus stop within the bracket, over the total number of bus stops in the bracket.

        for (const i in timetable) {
          if (i in timetable === false) {
            continue;
          }

          // Only calculate time table for a small window 1 hour before `minTime` and up to `maxTime`
          // More accurate filtering will be done further down the processing pipeline to increase accuracy.
          //
          // This filter is for performance purposes.
          if (
            new Date(minDate.getTime() - 1000 * 60 * 60) > timetable[i][0].datetime &&
            timetable[i][0].datetime < maxDate
          ) {
            continue;
          }

          // Clone the stops to avoid changing source values by reference which causes issues in each time table row iteration.
          const clonedStops = stops.map((stop): BusStop => {
            return { name: stop.name, point: stop.point };
          });

          // Map the time table stops to the complete stop list for this route.
          // This will give the time table stops in the full stops list a time, from
          // which the rest of the stops can be assigned an approximate time.
          const mappedTimeTableStops: BusStop[] = clonedStops.reduce(
            (acc: { stops: BusStop[]; timetable: TimetableEntry[] }, stop: BusStop, index) => {
              if (stop.name === acc.timetable[0].stop_name) {
                stop.time = acc.timetable[0].datetime;

                acc.stops.splice(index, 1, stop);

                // Remove the current time table row from the object so that the same index 0 is never re-assigned to
                // a stop. If this was allowed, multiple stops would share the same date time, which is not allowed.
                return {
                  stops: acc.stops,
                  timetable: acc.timetable.slice(1)
                };
              } else {
                return acc;
              }
            },
            { stops: clonedStops, timetable: timetable[i] }
          ).stops;

          // Check if the departure or arrival points in the mapped time table do not have a time. If this is the case
          // a time bracket has to be determined in order to estimate the times between the points with no official
          // defined times.
          if (!mappedTimeTableStops[first.index].time || !mappedTimeTableStops[last.index].time) {
            // If departure index has no time associated with it, determine the index offset, relative to the departure index.
            // This offset is the number of rows before the departure index, that has an associated time. Departure time index minus the offset
            // will be the lower boundary of a time bracket.
            const lowerLimitOffset =
              mappedTimeTableStops[first.index].time === undefined
                ? mappedTimeTableStops
                    .slice(0, first.index + 1)
                    .reverse()
                    .findIndex((stop) => stop.time)
                : 0;

            // Lower boundary is equal to the departure index, minus the offset.
            const lowerLimitIndex = first.index - lowerLimitOffset;

            // If arrival index has no time associated with it, determine the index offset, relative to the arrival index.
            // This offset is the number of rows after the arrival index, that has an associated time. Arrival time index plus the offset
            // will be the upper boundary of a time bracket.
            const upperLimitOffset =
              mappedTimeTableStops[last.index].time === undefined
                ? mappedTimeTableStops.slice(last.index, mappedTimeTableStops.length).findIndex((stop) => stop.time)
                : 0;

            // Upper boundary is equal to the arrival index, plus the offset.
            const upperLimitIndex = last.index + upperLimitOffset;

            // We now have two points with known times and the number of stops between them.
            // Continue to associate estimated times for the provided points that did not have an associate time (arrival, departure, or both).

            const timeBracketTime =
              mappedTimeTableStops[upperLimitIndex].time.getTime() - mappedTimeTableStops[lowerLimitIndex].time.getTime();

            const timeBracketStopCount = upperLimitIndex - lowerLimitIndex;

            const estimatedTimeBetweenBracketStops = timeBracketTime / timeBracketStopCount;

            // Populate stops with missing times, with calculated estimated times.
            mappedTimeTableStops.slice(lowerLimitIndex, upperLimitIndex).forEach((stop, index, arr) => {
              if (index > 0) {
                // arr[0] will always have be the time of the bracket lower boundary; base time.
                stop.time = new Date(arr[0].time.getTime() + estimatedTimeBetweenBracketStops * index);
              }
            });
          }

          generated_timetable.push({
            first: first.index,
            last: last.index,
            stops: mappedTimeTableStops
          });

          // const timeTableEntry = {
          //   first_time: new Date(mappedTimeTableStops[first.index].time.getTime()),
          //   last_time: new Date(mappedTimeTableStops[last.index].time.getTime()),
          //   first: {
          //     datetime: mappedTimeTableStops[first.index].time,
          //     time: '~' + timeStringForDate(new Date(mappedTimeTableStops[first.index].time)),
          //     stop_name: mappedTimeTableStops[first.index].name
          //   },
          //   last: {
          //     datetime: mappedTimeTableStops[last.index].time,
          //     time: '~' + timeStringForDate(new Date(mappedTimeTableStops[last.index].time)),
          //     stop_name: mappedTimeTableStops[last.index].name
          //   }
          // };

          // generated_timetable.push(timeTableEntry);
        }

        const filtered_timetable = generated_timetable.filter((row) => {
          // Only return the rows for which their index time is greater than the min time (now).
          // Do not want to give stops that will happen before the user gets there.
          return minDate < row.stops[row.first].time;
        });
        // .slice(0, 3);

        let linger_minutes = null;
        if (filtered_timetable.length > 0) {
          linger_minutes = Math.round(
            (filtered_timetable[0].stops[filtered_timetable[0].first].time.getTime() - minDate.getTime()) / 60000
          );
        }

        return of({
          timetable: filtered_timetable,
          linger_minutes: linger_minutes
        });
      })
    );
  }

  public annotateBusGraphic(modeSwitch: TripModeSwitch): Observable<TripModeSwitch> {
    const firstGraphic = modeSwitch.graphics[0];
    const lastGraphic = modeSwitch.graphics[modeSwitch.graphics.length - 1];

    // Pull the route number out of the attribute text
    const re_match = ROUTE_NUMBER_REGEX.exec(firstGraphic.attributes.text);

    if (re_match == null) {
      return of(modeSwitch);
    }
    const route_number = re_match[1];
    return this.stopsForRoute(route_number).pipe(
      switchMap((stops: BusStop[]) => {
        const first: BusStopWithIndex = this.getStopAtPoint(stops, (<esri.Polyline>firstGraphic.geometry).paths[0][0]);

        const last: BusStopWithIndex = this.getStopAtPoint(
          stops,
          (<esri.Polyline>lastGraphic.geometry).paths[0][(<esri.Polyline>lastGraphic.geometry).paths[0].length - 1]
        );

        const endpoints = this.getTripDepartureArrivalStops(stops, first, last);

        // TODO: firstGraphic.attributes.dateToHere
        // const testDate = new Date(1563218763000);
        const testDate = new Date(firstGraphic.attributes.dateToHere);

        return forkJoin([
          this.generateTimetable(route_number, endpoints.departure, endpoints.arrival, testDate),
          of(stops),
          of(endpoints.departure),
          of(endpoints.arrival)
        ]);
      }),
      switchMap((argument_list: [TimetableWithLinger, BusStop[], BusStopWithIndex, BusStopWithIndex]) => {
        const [generated_timetable, stops] = argument_list;
        const filtered_timetable = generated_timetable.timetable;
        const linger_minutes = generated_timetable.linger_minutes;
        if (filtered_timetable.length === 0 || linger_minutes == null) {
          return of(modeSwitch);
        }
        const on_bus_minutes =
          (filtered_timetable[0].stops[filtered_timetable[0].last].time.getTime() -
            filtered_timetable[0].stops[filtered_timetable[0].first].time.getTime()) /
          60000;

        // Create the modeSwitch results object if it doesn't exist. The resulting bus information will be stored
        // there.
        if (!modeSwitch.results) {
          modeSwitch.results = {};
        }

        modeSwitch.results.bus = {
          route_number: route_number,
          linger_minutes: linger_minutes,
          timetable: filtered_timetable,
          stop_count: stops.length,
          stops_list: stops
        };

        modeSwitch.results.relativeTime += on_bus_minutes + linger_minutes - firstGraphic.attributes.time;

        return of(modeSwitch);
      })
    );
  }

  /**
   * Determine the departure and arrival bus stops and points from full route stops list and determined geographic departure and arrival stops.
   *
   * Since the bus stops list and official time table loop, to where the first and last stop are the same by name (e.g. Trigon, off campus route),
   * this method performs a check and correction, assigning the correct bus stop if either the departure of arrival points are one of the bus stop extremes.
   *
   * @param {BusStop[]} stops Complete bus stops list
   * @param {BusStopWithIndex} departureStop Determined departure geographic point, and its index in the bus stops list
   * @param {BusStopWithIndex} arrivalStop Determined arrival geographic point, and its index in the bus stops list
   * @returns {{ departure: BusStopWithIndex; arrival: BusStopWithIndex }}
   */
  public getTripDepartureArrivalStops(
    stops: BusStop[],
    departureStop: BusStopWithIndex,
    arrivalStop: BusStopWithIndex
  ): { departure: BusStopWithIndex; arrival: BusStopWithIndex } {
    // Because `getStopAtPoint` has no way of knowing if the stop it's selecting for a given point is the first or last, it will gladly select an arrival point that is before
    // the departure time. This assumes no time table wrap around is being considered.

    // Assuming no wrap around, the arrival stop index must ALWAYS be greater than the departure stop. This is how time works.
    // Furthermore, check to make sure that the "incorrect" arrival stop shares the same stop name as the first row in the stops list.
    if (arrivalStop.index < departureStop.index && arrivalStop.stop.name === stops[0].name) {
      return {
        departure: {
          index: departureStop.index,
          stop: departureStop.stop
        },
        arrival: {
          index: stops.length - 1,
          stop: arrivalStop.stop
        }
      };
    } else {
      return {
        departure: departureStop,
        arrival: arrivalStop
      };
    }
  }

  public busesForRoute(short_name: string): Observable<RouteBus[]> {
    const timetable_url = `${this.base_url}/${short_name}/buses`;

    return forkJoin([
      this.http.get(timetable_url).pipe(
        catchError(() => {
          this.reportFailedRequest(`Buses`, short_name);

          return timer(1000).pipe(
            switchMap(() => {
              return this.http.get(timetable_url);
            })
          );
        })
      ),
      this.moduleProvider.require(['Point', 'SpatialReference', 'webMercatorUtils'])
    ]).pipe(
      map((argument: [TSBus[], [esri.PointConstructor, esri.SpatialReferenceConstructor, esri.webMercatorUtils]]) => {
        const [buses_raw, [Point, SpatialReference, webMercatorUtils]] = argument;
        const buses = buses_raw.map((bus_raw) => {
          const point = <esri.Point>webMercatorUtils.webMercatorToGeographic(
            new Point({
              y: bus_raw.GPS.Lat,
              x: bus_raw.GPS.Long,
              spatialReference: SpatialReference.WebMercator
            })
          );
          return {
            name: bus_raw.Name,
            passenger_capacity: bus_raw.APC.PassengerCapacity,
            current_passengers: bus_raw.APC.TotalPassenger,
            point: point,
            angle: bus_raw.GPS.Dir
          };
        });

        return buses;
      })
    );
  }

  public busMapLayer(): Observable<esri.Layer> {
    const id = 'bus-route-layer';
    let layer = <esri.GraphicsLayer>this._map.findLayerById(id);

    if (layer) {
      return of(layer);
    }

    return from(this.moduleProvider.require(['GraphicsLayer'])).pipe(
      switchMap(([GraphicsLayer]: [esri.GraphicsLayerConstructor]) => {
        layer = new GraphicsLayer({
          id: id,
          title: 'Bus Routes',
          listMode: 'hide'
        });

        // Attach the popup component (if the app provided one) so clicking a stop/route graphic on this
        // layer is resolved to a rendered popup by the popup service (which reads `layer.popupComponent`).
        if (this.busStopPopupComponent) {
          (layer as unknown as { popupComponent: Type<unknown> }).popupComponent = this.busStopPopupComponent;
        }

        this._map.add(layer);
        return of(layer);
      })
    );
  }

  public toggleMapRoute(
    short_name: string,
    symbols?: ('route' | 'stops' | 'buses')[],
    zoomToRoute = true
  ): void {
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
          [
            esri.GraphicConstructor,
            esri.SimpleLineSymbolConstructor,
            esri.SimpleMarkerSymbolConstructor,
            esri.PolylineConstructor
          ]
        ]
      ) => {
        const [routes, paths, stops, [Graphic, SimpleLineSymbol, SimpleMarkerSymbol, Polyline]] = argument;

        this.removeAllFromMap();

        const route = routes.find((r) => r.ShortName === short_name);

        let color = route ? route.Color : '#500000';

        // Only convert named colors, ESRI correctly maps other html colors such as #0f0 or rgb(102, 0, 102)
        if (!color.startsWith('#') && !color.startsWith('rgb')) {
          color = toHex(color);
        }

        const stopGraphics = stops.map((stop) => {
          return new Graphic({
            geometry: {
              type: 'point',
              longitude: stop.longitude,
              latitude: stop.latitude
            } as unknown as esri.GeometryProperties,
            attributes: {
              id: short_name,
              type: 'waypoints',
              OBJECTID: stop.objectId,
              StopName: stop.name,
              Route: stop.routes,
              StopType: stop.stopType,
              StopClass: stop.stopClass
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
          // extent (e.g. a shared bus-stop deep-link that has already zoomed to the stop).
          if (zoomToRoute) {
            this.mapService.store
              .pipe(
                take(1),
                map((instances) => instances.view)
              )
              .subscribe((m) => m.goTo(route_graphic));
          }
        }

        if (symbols == null || symbols.indexOf('stops') !== -1) {
          this._busLayer.getValue().addMany(stopGraphics);
        }

        // 'buses' (live vehicle locations) is intentionally a no-op: the ArcGIS source has no live GPS.
      }
    );
  }

  /**
   * Returns the ordered list of stop names for a route, sourced from the denormalized `Stop1..Stop31`
   * fields on the Bus Routes layer. Used to populate the route detail panel.
   */
  public getRouteStops(short_name: string): Observable<string[]> {
    const stopFields = Array.from({ length: 31 }, (_, i) => `Stop${i + 1}`);

    return this.arcgisQuery(1, {
      where: `RouteNum='${this.escapeSql(short_name)}'`,
      outFields: stopFields.join(','),
      returnGeometry: 'false'
    }).pipe(
      map((response: ArcGISQueryResponse) => {
        const feature = response.features && response.features[0];

        if (!feature) {
          return [];
        }

        return stopFields
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
      where: `RouteNum='${this.escapeSql(short_name)}'`,
      outFields: 'RouteNum',
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
   * The `Route` field is a comma-separated list (e.g. `05, 08, 35`), so the `LIKE` pre-filter is narrowed
   * with an exact token match to avoid false positives (e.g. `05` matching `NW0305`).
   */
  private routeStops(short_name: string): Observable<MapStop[]> {
    return this.arcgisQuery(0, {
      where: `Route LIKE '%${this.escapeSql(short_name)}%'`,
      outFields: 'OBJECTID,StopName,Route,StopType,StopClass',
      returnGeometry: 'true',
      outSR: '4326'
    }).pipe(
      map((response: ArcGISQueryResponse) => {
        const stops: MapStop[] = [];

        for (const feature of response.features || []) {
          const routes = (feature.attributes.Route ?? '').toString().trim();
          const routeTokens = routes.split(',').map((token) => token.trim());

          if (routeTokens.indexOf(short_name) === -1) {
            continue;
          }

          const stopType = (feature.attributes.StopType ?? '').toString().trim();
          const timed = stopType.toLowerCase() === 'time';
          const points = (feature.geometry && feature.geometry.points) || [];

          for (const point of points) {
            stops.push({
              longitude: point[0],
              latitude: point[1],
              timed: timed,
              objectId: Number(feature.attributes.OBJECTID),
              name: (feature.attributes.StopName ?? '').toString().trim(),
              routes: routes,
              stopType: stopType,
              stopClass: (feature.attributes.StopClass ?? '').toString().trim()
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
   * Issues a query against a layer of the ArcGIS Bus Routes MapServer, returning the parsed JSON.
   */
  private arcgisQuery(layerId: number, params: { [key: string]: string }): Observable<ArcGISQueryResponse> {
    const query = Object.entries({ f: 'json', ...params })
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');

    return this.http.get<ArcGISQueryResponse>(`${this.serviceUrl}/${layerId}/query?${query}`);
  }

  /**
   * Builds a `RouteNum -> css color` map from the Bus Routes layer's uniqueValue renderer.
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

  private escapeSql(value: string): string {
    return value.replace(/'/g, "''");
  }

  /**
   * Adds, updates, or removes buses (icons) from the map.
   */
  public toggleBusLocations(short_name: string, action: 'update' | 'remove') {
    const layer = this._busLocationsLayer
      ? this._busLocationsLayer
      : (this._map.findLayerById('buses-feature-layer') as esri.FeatureLayer);

    /**
     * Returns a promise of a true copy (not by reference) of mapped features by their id.
     */
    const getFeatures = () =>
      layer
        ? layer
            .queryFeatures({
              // where: `route = '${short_name}'`
              where: `1=1`
            })
            .then((features) => {
              if (features.features.length === 0) {
                return [];
              } else {
                return features.features.map((f) => f.clone());
              }
            })
        : undefined;

    if (action === 'remove') {
      const features = getFeatures();

      if (features) {
        getFeatures().then((res) => {
          layer.applyEdits({
            deleteFeatures: res
          });
        });
      }
    } else if (action === 'update') {
      Promise.all([
        this.moduleProvider.require(['Point', 'Graphic', 'FeatureLayer', 'PictureMarkerSymbol']),
        this.busesForRoute(short_name).toPromise(),
        getFeatures() as unknown as Promise<esri.Graphic[]>
      ]).then(
        (
          result: [
            [
              esri.PointConstructor,
              esri.GraphicConstructor,
              esri.FeatureLayerConstructor,
              esri.PictureMarkerSymbolConstructor
            ],
            RouteBus[],
            esri.Graphic[]
          ]
        ) => {
          const [[Point, Graphic, FeatureLayer, PictureMarkerSymbol], apiBuses, features] = result;

          const makeBusGraphic = (bus) => {
            return new Graphic({
              geometry: {
                type: 'point',
                latitude: bus.point.latitude,
                longitude: bus.point.longitude
              } as unknown as esri.GeometryProperties,
              attributes: {
                name: bus.name,
                route: short_name,
                type: 'buses',
                rotation: bus.angle
              }
            });
          };

          // If no features, add.
          if (!layer) {
            const busGraphics = apiBuses.map((bus) => makeBusGraphic(bus));

            const featureLayer = new FeatureLayer({
              id: 'buses-feature-layer',
              objectIdField: 'id',
              source: busGraphics,
              listMode: 'hide',
              geometryType: 'point',
              title: 'AggieSpirit Live Location',
              fields: [
                {
                  name: 'id',
                  alias: 'id',
                  type: 'oid'
                },
                {
                  name: 'route',
                  alias: 'route',
                  type: 'string'
                },
                {
                  name: 'name',
                  alias: 'name',
                  type: 'string'
                },
                {
                  name: 'type',
                  alias: 'type',
                  type: 'string'
                },
                {
                  name: 'rotation',
                  alias: 'rotation',
                  type: 'double'
                }
              ],
              renderer: {
                type: 'simple',
                symbol: new PictureMarkerSymbol({
                  url: `${window.location.href.replace(this.location.path(), '')}/assets/images/busDir.png`,
                  angle: 0,
                  height: 30,
                  width: 30
                }),
                visualVariables: [
                  {
                    type: 'rotation',
                    field: 'rotation',
                    rotationType: 'geographic'
                  }
                ]
              } as esri.RendererProperties
            });

            this._map.add(featureLayer);
          } else {
            // When updating bus locations, there are three possible categories for the buses returned
            // from the bus API and the ones already on the map.
            //
            // 1. Existing - Update locations for buses on map
            // 2. Adding - Add new bus to map
            // 2. Deleting - Remove bus from map

            // Collect all existing buses that need a location update.
            const existing = features
              .filter((bus) => {
                return (
                  apiBuses.findIndex((apiBus) => {
                    return apiBus.name === bus.attributes.name;
                  }) > -1
                );
              })
              .map((bus) => {
                const apiMatch = apiBuses.find((apiBus) => apiBus.name === bus.attributes.name);

                bus.attributes.rotation = apiMatch.angle;
                bus.geometry = new Point({
                  latitude: apiMatch.point.latitude,
                  longitude: apiMatch.point.longitude
                });
                return bus;
              });

            const toAddToMap = apiBuses
              .filter((apiBus) => {
                return features.findIndex((bus) => apiBus.name === bus.attributes.name) === -1;
              })
              .map((apiBus) => {
                return makeBusGraphic(apiBus);
              });

            const toRemoveFromMap = features.filter((bus) => {
              return apiBuses.findIndex((apiBus) => apiBus.name === bus.attributes.name) === -1;
            });

            layer.applyEdits({
              updateFeatures: existing,
              addFeatures: toAddToMap,
              deleteFeatures: toRemoveFromMap
            });
          }
        }
      );
    } else {
      throw new Error('Unsupported action.');
    }
  }

  /**
   * Removes all routes, waypoints, and bus markers from the map for any drawn route(s).
   */
  public removeAllFromMap() {
    this._busLayer.getValue().removeAll();
  }

  private reportFailedRequest(type: string, route: string) {
    const label = {
      guid: guid(),
      date: Date.now(),
      name: `${type}|${route}`
    };

    this.analytics.eventTrack.next({
      action: 'bus_fail',
      properties: {
        category: 'network_request',
        gstCustom: label
      }
    });
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

interface TSWaypoint {
  Name: string;
  Longtitude: number; // This typo is intentional. Its spelled wrong in the API
  Latitude: number;
  Stop?: {
    IsTimePoint: boolean;
  };
}

interface TSTimetable {
  [key: string]: string;
}

interface TSStopJson {
  Name: string;
  Longtitude: number; // This typo is intentional. Its spelled wrong in the API
  Latitude: number;
}

interface TSBus {
  Name: string;
  APC: {
    PassengerCapacity: number;
    TotalPassenger: number;
  };
  GPS: {
    Dir: number; // angle of bus
    Lat: number;
    Long: number;
  };
}

export interface Waypoint {
  name: 'Way Point' | string;
  point: esri.Point;
  stop: boolean;
  timed_stop: boolean;
}

export interface BusStop {
  name: string;
  point: esri.Point;
  time?: Date;
}

export interface BusStopWithIndex {
  index: number;
  stop: BusStop;
}

export interface RouteBus {
  name: string;
  passenger_capacity: number;
  current_passengers: number;
  point: esri.Point;
  angle: number;
}

export interface TimetableEntry {
  stop_name: string;
  time: string;
  datetime: Date;
}

export interface TimetableRow {
  first: number;
  last: number;
  stops: BusStop[];
}

interface TimetableWithLinger {
  timetable: TimetableRow[];
  linger_minutes: number;
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
