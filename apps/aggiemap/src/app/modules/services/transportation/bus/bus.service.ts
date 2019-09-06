import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, from, Observable, of, BehaviorSubject } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

import { EsriModuleProviderService } from '@tamu-gisc/maps/esri';
import { TripModeSwitch } from '../../trip-planner/trip-planner.service';
import { EsriMapService, MapServiceInstance } from '@tamu-gisc/maps/esri';

import { dateForDateTimeString } from '@tamu-gisc/common/utils/date';
import { relativeDistance } from '@tamu-gisc/common/utils/geometry/generic';

import toHex from 'colornames';

import esri = __esri;
import { Point as LatLon } from '@tamu-gisc/common/types';
import { Location } from '@angular/common';

const ROUTE_NUMBER_REGEX = /on ([0-9\-A-Za-z]+)$/;

@Injectable()
export class BusService {
  private base_url = 'https://nodes.geoservices.tamu.edu/api/route';

  private _routes = null;
  private stop_map = [];
  private timetable_map = [];
  private waypoint_map = [];

  private _map: esri.Map;
  private _view: esri.MapView;

  private _busLayer: BehaviorSubject<esri.GraphicsLayer> = new BehaviorSubject({} as any);
  public busLayer: Observable<esri.GraphicsLayer> = this._busLayer.asObservable();

  private _busLayerGraphics: BehaviorSubject<esri.Graphic[]> = new BehaviorSubject([]);
  public busLayerGraphics: Observable<esri.Graphic[]> = this._busLayerGraphics.asObservable();

  private _busLocationsLayer: esri.FeatureLayer;

  constructor(
    private http: HttpClient,
    private moduleProvider: EsriModuleProviderService,
    private mapService: EsriMapService,
    private location: Location
  ) {
    from(mapService.store).subscribe((mapInstance: MapServiceInstance) => {
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
      busLayer.graphics.on('change', (event: any) => {
        return this._busLayerGraphics.next((<esri.Collection<esri.Graphic>>event.target).clone().toArray());
      });
    });
  }

  /**
   * Fetches the bus routes and caches the result for faster access while the service remains alive.
   *
   * @returns {Observable<TSRoute[]>}
   * @memberof BusService
   */
  public getRoutes(): Observable<TSRoute[]> {
    const routes_url = this.base_url + '/';
    if (this._routes != null) {
      return of(this._routes);
    }
    return this.http.get(routes_url).pipe(
      tap((routes: TSRoute[]) => {
        this._routes = routes;
      })
    );
  }

  public waypointsForRoute(short_name: string): Observable<Waypoint[]> {
    const waypoints_url = `${this.base_url}/${short_name}/route`;
    const matching_waypoints = this.waypoint_map.filter((el) => el.short_name === short_name);
    if (matching_waypoints.length > 0 && matching_waypoints[0].stops != null) {
      return of(matching_waypoints[0].waypoints);
    }
    return forkJoin([
      this.http.get(waypoints_url),
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
      this.http.get(stops_url),
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

        /**
         * Determines the index of of a primary timetable stop
         * that is equal to the input name, if any.
         *
         * Since the primary timetable does not include "waypoints", the provided input name
         * is more often times than not, not included in the primary timetable. In this case,
         * the return value will be `-1`, for "not found";
         *
         * @param {string} name
         * @returns {number}
         */
        const timetableColumnIndex = (name: string): number => {
          return timetable[0].findIndex((record, i, arr) => {
            return name === record.stop_name;
          });
        };

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
        // bus stop wihitn the bracket, over the total number of bus stops in the bracket.

        for (const i in timetable) {
          if (!timetable.hasOwnProperty(i)) {
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
          const clonedStops = stops.map(
            (stop): BusStop => {
              return { name: stop.name, point: stop.point };
            }
          );

          // Map the time table stops to the complete stop list for this route.
          // This will give the time table stops in the full stops list a time, from
          // which the rest of the stops can be assigned an approximate time.
          const mappedTimeTableStops: BusStop[] = clonedStops.reduce(
            (acc: { stops: BusStop[]; timetable: TimetableEntry[] }, stop: BusStop, index, arr) => {
              if (stop.name === acc.timetable[0].stop_name) {
                stop.time = acc.timetable[0].datetime;

                acc.stops.splice(index, 1, stop);

                // Remove the current time table row freom the object so that the same index 0 is never re-assigned to
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
          // a time bracket has to be determined in odre to estimate the times between the points with no official
          // defined times.
          if (!mappedTimeTableStops[first.index].time || !mappedTimeTableStops[last.index].time) {
            // If departure index has no time associated with it, determine the index offset, relative to the departure index.
            // This offset is the number of rows before the departure index, that has an associated time. Depature time index minus the offset
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
            // This offset is the number of rows after the arrvail index, that has an associated time. Arrival time index plus the offset
            // will be the upper boundary of a time bracket.
            const upperLimitOffset =
              mappedTimeTableStops[last.index].time === undefined
                ? mappedTimeTableStops.slice(last.index, mappedTimeTableStops.length).findIndex((stop) => stop.time)
                : 0;

            // Upper boundary is equal to the arrival index, plus the offset.
            const upperLimitIndex = last.index + upperLimitOffset;

            // We now have two points with known times and the number of stops between them.
            // Continue to associate estimated times for the provided poitns that did not have an associate time (arrival, departure, or both).

            const timeBracketTime = mappedTimeTableStops[upperLimitIndex].time - mappedTimeTableStops[lowerLimitIndex].time;

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
        const first: BusStopWithIndex = this.getStopAtPoint(stops, (<any>firstGraphic.geometry).paths[0][0]);

        const last: BusStopWithIndex = this.getStopAtPoint(
          stops,
          (<any>lastGraphic.geometry).paths[0][(<any>lastGraphic.geometry).paths[0].length - 1]
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
   * Since the bus stops list and official time table loop, to where the first tand last stop are the same by name (e.g. Trigon, off campus route),
   * this method performs a check and correction, assigning the correct bus stop if either the departure of arrival points are one of the bus stop extremes.
   *
   * @param {BusStop[]} stops Complete bus stops list
   * @param {BusStopWithIndex} departureStop Determined departure geographic point, and its index in the bus stops list
   * @param {BusStopWithIndex} arrivalStop Determined arrival geographic point, and its index in the bus stops list
   * @returns {{ departure: BusStopWithIndex; arrival: BusStopWithIndex }}
   * @memberof BusService
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
      this.http.get(timetable_url),
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
        this._map.add(layer);
        return of(layer);
      })
    );
  }

  public toggleMapRoute(short_name: string, symbols?: ('route' | 'stops' | 'buses')[]): void {
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
    } else {
      forkJoin([
        this.getRoutes(),
        this.waypointsForRoute(short_name),
        this.moduleProvider.require([
          'Graphic',
          'SimpleLineSymbol',
          'SimpleMarkerSymbol',
          'Polyline',
          'PictureMarkerSymbol',
          'FeatureLayer',
          'Point'
        ])
      ]).subscribe(
        (
          argument: [
            TSRoute[],
            Waypoint[],
            [
              esri.GraphicConstructor,
              esri.SimpleLineSymbolConstructor,
              esri.SimpleMarkerSymbolConstructor,
              esri.PolylineConstructor,
              esri.PictureMarkerSymbolConstructor,
              esri.FeatureLayerConstructor,
              esri.PointConstructor
            ]
          ]
        ) => {
          const [
            routes,
            waypoints,
            [Graphic, SimpleLineSymbol, SimpleMarkerSymbol, Polyline, PictureMarkerSymbol, FeatureLayer, Point]
          ] = argument;

          this.removeAllFromMap();
          const route = routes.find((r) => r.ShortName === short_name);

          const points = waypoints.map((waypoint) => [waypoint.point.longitude, waypoint.point.latitude]);

          let color = route.Color;

          // Only convert named colors, ESRI correctly maps other html colors such as #0f0 or rgb(102, 0, 102)
          if (!color.startsWith('#') && !color.startsWith('rgb')) {
            color = toHex(color);
          }

          const stops = waypoints
            .filter((waypoint) => waypoint.stop)
            .map((waypoint) => {
              return new Graphic({
                geometry: waypoint.point,
                attributes: {
                  id: short_name,
                  type: 'waypoints'
                },
                symbol: new SimpleMarkerSymbol({
                  style: waypoint.timed_stop ? 'square' : 'circle',
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
              paths: [points]
            }),
            attributes: {
              id: short_name,
              type: 'route'
            },
            symbol: new SimpleLineSymbol({
              color: color,
              width: 3
            })
          });

          if (symbols == null || symbols.indexOf('route') !== -1) {
            this._busLayer.getValue().add(route_graphic);
          }
          if (symbols == null || symbols.indexOf('stops') !== -1) {
            this._busLayer.getValue().addMany(stops);
          }
        }
      );
    }
  }

  /**
   * Adds, updates, or removes buses (icons) from the map.
   *
   * @param {string} short_name
   * @memberof BusService
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
        getFeatures() as any
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
              },
              attributes: {
                name: bus.name,
                route: short_name,
                type: 'buses',
                rotation: bus.angle
              }
            } as any);
          };

          // If no features, add.
          if (!layer) {
            const busGraphics = apiBuses.map((bus) => makeBusGraphic(bus));

            const featureLayer = new FeatureLayer({
              id: 'buses-feature-layer',
              objectIdField: 'id',
              source: busGraphics,
              listMode: 'hide',
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
                  height: 35,
                  width: 35
                }),
                visualVariables: [
                  {
                    type: 'rotation',
                    field: 'rotation',
                    rotationType: 'geographic'
                  }
                ]
              } as any
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
   *
   * @memberof BusService
   */
  public removeAllFromMap() {
    this._busLayer.getValue().removeAll();
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
   *
   * @type {string}
   * @memberof TSRoute
   */
  Color: string;

  /**
   * JSON string with, from what I can tell, redundant information already in the object.
   *
   * @type {string}
   * @memberof TSRoute
   */
  Description: string;

  Group: TSRouteGroup;

  Icon: string;

  Key: string;

  /**
   * Bus route name.
   *
   * Example: `Elephant walk`
   *
   * @type {string}
   * @memberof TSRoute
   */
  Name: string;

  /**
   * Bus route number
   *
   * Example: `31`
   *
   * @type {string}
   * @memberof TSRoute
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
   *
   * @type {boolean}
   * @memberof TSRouteGroup
   */
  IsGameDay: boolean;

  /**
   * Containing bus group name.
   *
   * @type {string}
   * @memberof TSRouteGroup
   */
  Name: string;

  /**
   * Specifies display order of containing bus group.
   *
   * @type {number}
   * @memberof TSRouteGroup
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
  time?: any;
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
