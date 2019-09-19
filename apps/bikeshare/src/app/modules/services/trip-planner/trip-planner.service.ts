import { Injectable, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  BehaviorSubject,
  combineLatest,
  forkJoin,
  from,
  iif,
  Observable,
  of,
  Subscription,
  throwError,
  zip,
  Subject
} from 'rxjs';
import { catchError, concatMap, flatMap, map, mergeMap, scan, switchMap, tap, toArray, takeUntil } from 'rxjs/operators';

import { Angulartics2 } from 'angulartics2';

import { EsriMapService, MapServiceInstance } from '@tamu-gisc/maps/esri';
import { EsriModuleProviderService } from '@tamu-gisc/maps/esri';

import { SearchService, SearchResult, SearchResultItem } from '@tamu-gisc/search';

import { TripPlannerConnection, TripPlannerConnectionService } from './trip-planner-connection.service';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import {
  TripResult,
  TripPoint,
  TripPointProperties,
  TripPointOriginTransformationsParams,
  TripPointOriginParams
} from './core/trip-planner-core';
import { BusService } from '../transportation/bus/bus.service';
import { InrixService } from '../transportation/drive/inrix.service';
import { BikeService } from '../transportation/bike/bike.service';
import { ParkingService } from '../transportation/drive/parking.service';
import { SettingsService, SettingsInitializationConfig } from '@tamu-gisc/common/ngx/settings';

import { LayerSource } from '@tamu-gisc/common/types';
import { LayerSources } from '../../../../environments/environment';

import { findNearestIndex, isCoordinatePair, getGeolocation } from '@tamu-gisc/common/utils/geometry/generic';
import { pairwiseOverlap } from '@tamu-gisc/common/utils/collection';
import { timeStringForDate } from '@tamu-gisc/common/utils/date';

import { brazosCounty } from '../../../map/polygons';
import * as guid from 'uuid/v4';
import * as gju from 'geojson-utils';
import { minBy } from 'lodash';

import esri = __esri;

@Injectable()
export class TripPlannerService implements OnDestroy {
  private settingsConfig: SettingsInitializationConfig = {
    storage: {
      subKey: 'trip-planner'
    },
    settings: {
      travel_mode: {
        value: 1
      },
      accessible: {
        value: false,
        persistent: true
      },
      parking_pass: {
        value: false,
        effects: {
          get: {
            target: 'Use_Permit',
            fn: (v) => v
          },
          set: {
            target: 'Use_Permit',
            fn: (v) => v
          }
        }
      },
      parking_pass_permit: {
        value: undefined,
        effects: {
          get: {
            target: 'Permit',
            fn: (v) => v
          },
          set: {
            target: 'Permit',
            fn: (v) => v
          }
        }
      },
      nearest_door: {
        value: false
      },
      a_b_networks: {
        value: false
      },
      bike_share: {
        value: false,
        persistent: true
      },
      polygon_barriers: {
        value: false
      },
      requested_time: {
        value: undefined
      },
      time_mode: {
        value: 'now'
      }
    }
  };

  /**
   * Container for trip planner routing esri modules.
   *
   * @private
   * @type {*}
   * @memberof TripPlannerService
   */
  private _Modules: any = {};

  public readonly rule_walk: TripPlannerRule = {
    modes: [
      {
        displayName: 'Walking',
        mode: 1,
        directions_verb: 'Walk',
        directions_icon: 'directions_walk'
      },
      {
        displayName: 'Accessible',
        mode: 2,
        directions_verb: 'Walk',
        directions_icon: 'directions_walk',
        determinants: {
          accessible: true
        }
      }
    ],
    constraints: ['accessible']
  };

  public readonly rule_drive: TripPlannerRule = {
    modes: [
      {
        displayName: 'Visitor Accessible',
        mode: 8,
        directions_verb: 'Drive',
        directions_icon: 'directions_car',
        determinants: {
          accessible: true
        }
      },
      {
        displayName: 'Visitor Non-Accessible',
        mode: 8,
        directions_verb: 'Drive',
        directions_icon: 'directions_car',
        determinants: {
          accessible: false
        }
      },
      {
        displayName: 'Use Parking Pass',
        description:
          'Select this option if you have a parking pass and would like directions to lots the parking pass permits.',
        modes: [
          {
            visible: true,
            mode: 3,
            directions_verb: 'Drive',
            directions_icon: 'directions_car',
            determinants: {
              parking_pass: true
            },
            effect: 'parking_pass',
            split: {
              default: 1
            }
          },
          {
            visible: false,
            mode: 4,
            directions_verb: 'Drive',
            directions_icon: 'directions_car',
            determinants: {
              accessible: true,
              parking_pass: true
            },
            split: {
              default: 2
            }
          }
        ]
      }
    ],
    constraints: ['accessible', 'parking_pass']
  };

  public readonly rule_bus: TripPlannerRule = {
    modes: [
      {
        displayName: 'Bus',
        mode: 5,
        directions_verb: 'Bus',
        directions_icon: 'directions_bus'
      },
      {
        displayName: 'Accessible',
        directions_verb: 'Bus',
        directions_icon: 'directions_bus',
        determinants: {
          accessible: true
        },
        mode: 6
      }
    ],
    constraints: ['accessible']
  };

  public readonly rule_bike: TripPlannerRule = {
    modes: [
      {
        visible: false,
        displayName: 'Personal',
        mode: 7,
        directions_verb: 'Bike',
        directions_icon: 'directions_bike'
      },
      {
        visible: true,
        displayName: 'Bike Share',
        description:
          'If not using personal bike, will first route to a bike rack with multiple bike share units for pickup.',
        mode: 7,
        directions_verb: 'Bike',
        directions_icon: 'directions_bike',
        determinants: {
          bike_share: true
        },
        effect: 'bike_share',
        split: {
          default: 1
        }
      }
    ],
    constraints: ['accessible', 'bike_share']
  };

  private readonly rules: TripPlannerRule[] = [this.rule_drive, this.rule_walk, this.rule_bus, this.rule_bike];

  private _Rules: BehaviorSubject<TripPlannerRule[]> = new BehaviorSubject(this.rules);

  public readonly Rules: Observable<TripPlannerRule[]> = this._Rules.asObservable();

  private _TravelOptions: BehaviorSubject<TravelOptions> = new BehaviorSubject({});

  public readonly TravelOptions: Observable<any> = this._TravelOptions.asObservable();

  /**
   * A container which will contain any number of RouteTask stops
   *
   * @private
   * @type {TripPoint[]}
   * @memberof TripPlannerService
   */
  private readonly _Stops: BehaviorSubject<TripPoint[]>;

  /**
   * Publicly exposed observable for the trip planner service stops store.
   *
   * Stops used to generate a trip.
   *
   * @type {Observable < TripPoint[] >}
   * @memberof TripPlannerService
   */
  public readonly Stops: Observable<TripPoint[]>;

  /**
   * Service container which will contain a route result from a trip directions request
   *
   * @private
   * @type {BehaviorSubject < RouteResult >}
   * @memberof TripPlannerService
   */
  // private _Result: BehaviorSubject<TripResult> = new BehaviorSubject(undefined);
  private _Result: BehaviorSubject<TripResult[]> = new BehaviorSubject([]);

  /**
   * Publicly exposed observable for the trip planner service route result
   *
   * Result used to draw the path on the map.
   *
   * @type {Observable < RouteResult >}
   * @memberof TripPlannerService
   */
  // public readonly Result: Observable<TripResult> = this._Result.asObservable();
  public readonly Result: Observable<TripResult[]> = this._Result.asObservable();

  /**
   * Represents the url for the current trip planner connection service being used that
   * the RouteTask module will use when executing a route.
   *
   * @type {string}
   * @memberof TripPlannerService
   */
  public connection: TripPlannerConnection;

  private _map: esri.Map;

  private _view: esri.MapView;

  /**
   * Stores observable subscription to the trip planner connection service current network.
   *
   * @private
   * @type {Subscription}
   * @memberof TripPlannerService
   */
  private _currentNetworkSubscrption: Subscription;

  /**
   * Sets service trip points and notifies all subscribers of the change.
   *
   * Executes trip task.
   *
   * @memberof TripPlannerService
   */
  public set stops(v: TripPoint[]) {
    this._Stops.next(v);

    this.executeTripTask();
  }

  /**
   * Sets service route result object and notifies all subscribers of the change.
   *
   * @memberof TripPlannerService
   */
  // public set result(v: TripResult) {
  public set result(v: TripResult[]) {
    this._Result.next(v);
  }

  private $destroy: Subject<boolean> = new Subject();

  public initializeHandlers() {
    this._view.on('click', (e: esri.MapViewClickEvent) => {
      const layer: any = this._map.findLayerById('buildings-layer');
      // Allow click coordinates only when on the trip planner route
      if (this.router.url.includes('trip')) {
        this.mapService.featuresIntersectingPoint(layer, e.mapPoint).then((res) => {
          // If the query returns a feature in the value use the first item in that list
          if (res.features.length > 0) {
            this.setStops([
              new TripPoint({
                source: 'map-event',
                originAttributes: res.features[0].attributes,
                originGeometry: { latitude: e.mapPoint.latitude, longitude: e.mapPoint.longitude },
                originParameters: {
                  type: 'map-event',
                  value: {
                    latitude: e.mapPoint.latitude,
                    longitude: e.mapPoint.longitude
                  }
                }
              })
            ]);
          } else {
            // If the query does not retrun a feature in the value, use the event coordinates.
            this.setStops([
              new TripPoint({
                source: 'map-event',
                originGeometry: { latitude: e.mapPoint.latitude, longitude: e.mapPoint.longitude },
                originParameters: {
                  type: 'map-event',
                  value: {
                    latitude: e.mapPoint.latitude,
                    longitude: e.mapPoint.longitude
                  }
                }
              })
            ]);
          }
        });
      }
    });
  }

  /**
   * Updates multiple properties from a key-value object. Example:
   *
   * ```
   {
     accessible: true,
     parking_pass: true
   }
   ```
   *
   * Performs checks to ensure the provided properties are valid and the associated values
   * are of the same type.
   *
   * Also updates state travel mode based on state's last value and new constraints.
   *
   * @param {{}} options
   * @memberof TripPlannerService
   */
  public updateTravelOptions(options: {}) {
    this.settings.updateSettings(options);
    if (!Object.keys(options).includes('travel_mode')) {
      this.calculateTravelMode([this._TravelOptions.getValue().travel_mode], true);
    }
  }

  constructor(
    private router: Router,
    private moduleProvider: EsriModuleProviderService,
    private mapService: EsriMapService,
    private connectionService: TripPlannerConnectionService,
    private analytics: Angulartics2,
    private ns: NotificationService,
    private url: ActivatedRoute,
    private search: SearchService,
    private busService: BusService,
    private bikeService: BikeService,
    private parkingService: ParkingService,
    private inrixService: InrixService,
    private settings: SettingsService
  ) {
    this.settings.init(this.settingsConfig).subscribe((res: TravelOptions) => {
      if (res) {
        this._TravelOptions.next(res);

        // Clear existing route and execute trip task on settings change.
        this.clearRoute();
        this.executeTripTask();
      }
    });

    // Combine module provider require and map service store to keep a reference and execute
    // additional methods when both streams complete.
    zip(moduleProvider.require(['RouteTask', 'RouteParameters', 'FeatureSet', 'Graphic'], true), mapService.store)
      .pipe(takeUntil(this.$destroy))
      .subscribe((results: [any, MapServiceInstance]) => {
        this._Modules.TripTask = results[0].RouteTask;
        this._Modules.TripParameters = results[0].RouteParameters;
        this._Modules.FeatureSet = results[0].FeatureSet;
        this._Modules.Graphic = results[0].Graphic;

        // Locally store instance of map and view, allowing direct map and view manipulation
        this._map = results[1].map;
        this._view = results[1].view;

        this.loadTripFromURL();

        this.initializeHandlers();
      });

    // Subscribe to the trip planner connection service and store the selected connection url when available.
    this._currentNetworkSubscrption = this.connectionService.currentNetwork
      .pipe(takeUntil(this.$destroy))
      .subscribe((connection) => {
        this.connection = connection;

        this.executeTripTask();
      });

    // Create two empty stops because a trip request always has a minimum of 2 stops.
    const stops = this.generateEmptyDefaultStops();

    // Instantiate a Behaviour Subject to the local stops store, with the generated stops as the initial value
    this._Stops = new BehaviorSubject(stops);

    // Instantiate an observable from the local stops store
    this.Stops = this._Stops.asObservable();
  }

  public ngOnDestroy() {
    this.$destroy.next(true);
    this.$destroy.complete();
  }

  /**
   * Returns an array of travel modes that qualify based on state settings (accessibility, etc.).
   *
   * @returns {number[]}
   * @memberof TripPlannerService
   */
  public getQualifyingTravelModes(returnNumbersOnly?: false): TripPlannerRuleMode[];
  public getQualifyingTravelModes(returnNumbersOnly?: true): number[];
  public getQualifyingTravelModes(returnNumbersOnly?: any): any {
    const numberOnly = returnNumbersOnly || false;

    const modes = this._Rules.value
      .map((rule) => {
        return this.getTravelModeFromRule(rule, numberOnly);
      })
      .filter((mode) => {
        return mode !== undefined;
      });

    // Create a set with the current travel mode first, which will remove any duplicates in the qualifying filtered modes array.
    // Will ensure that the current travel mode will be calculated first.
    const sorted = new Set([...modes]);

    return Array.from(sorted);
  }

  /**
   * Transforms a travel rule into a one-dimensional array of modes.
   *
   * Recursively extracts ALL nested `modes` arrays.
   *
   * @param {*} rule
   * @returns
   * @memberof TripPoint
   */
  public flattenRule(rule): TripPlannerRuleMode[] {
    const currModes = rule && rule.modes ? rule.modes : undefined;
    const childrenModes = rule && rule.modes && rule.modes.some((u) => u.modes);

    // If current unit has modes and contains further children modes, do recursive fn until end is reached.
    if (currModes && childrenModes) {
      return rule.modes.reduce((acc, curr, index) => {
        const cM = curr.modes;

        if (cM) {
          const nChildModes = cM.map((cm) => {
            const modes = this.flattenRule(cm);

            const propAppend = (instance) => {
              if (!instance.description && curr.description) {
                instance.description = curr.description;
              }

              if (!instance.displayName && curr.displayName) {
                instance.displayName = curr.displayName;
              }

              return instance;
            };

            // Handle copying over parent properties over to children modes.
            if (modes instanceof Array) {
              return modes.map((i) => propAppend(i));
            } else {
              return propAppend(modes);
            }
          });

          return [...acc, ...nChildModes];
        } else {
          return [...acc, curr];
        }
      }, []);
    } else if (currModes) {
      // If current unit has modes but none of them have children modes, return the modes.
      return currModes;
    } else {
      // If the current unit has no modes, return the unit;
      return rule;
    }
  }

  /**
   * Accepts an Array of mode values and returns the first TripPlannerRule that contains **ALL** modes.
   *
   * This is helpful in finding a particular rule with potentially overlapping modes, in which each additional
   * constraint can achieve uniqueness.
   *
   * @param {number[]} modes
   * @returns
   * @memberof TripPlannerService
   */
  public getRuleForModes(modes: number[]): TripPlannerRule {
    const rule = this.rules.find((r) => {
      const flattened = this.flattenRule(r);

      // Check if the current flattened rule contains every mode in the constraints list.
      const ruleHasModes = modes.every((cMode) => {
        const modeIndex = flattened.findIndex((m) => {
          return m && m.mode && m.mode === cMode;
        });

        // If the current mode equals the current constraint, return true.
        return modeIndex > -1;
      });

      if (ruleHasModes) {
        return true;
      } else {
        return false;
      }
    });

    return rule;
  }

  /**
   * Returns a TripPlannerRule belonging to the current travel mode.
   *
   * @returns {TripPlannerRule}
   * @memberof TripPlannerService
   */
  public getCurrentRule(): TripPlannerRule {
    return this.getRuleForModes([this._TravelOptions.value.travel_mode]);
  }

  /**
   * Accepts a collection of travel modes and determines, used to determinet he parent rule. Then, each mode
   * from the parent rule is tested against the state travel option constraints and returns the mode conforming
   * to the constraints.
   *
   * Has the ability to update service travel mode state with the newly calculated value.
   *
   * @param {number[]} determinants
   * @param {boolean} [updateState]
   * @returns {number}
   * @memberof TripPlannerService
   */
  public calculateTravelMode(determinants: number[], updateState?: boolean): number {
    const parent = this.getRuleForModes(determinants);

    const mode = this.getTravelModeFromRule(parent, true);

    if (mode) {
      if (updateState) {
        this.updateTravelOptions({ travel_mode: mode });
      }

      return mode;
    } else {
      // console.(`Could not determine travel mode from determinants: ${determinants.toString()}`);
    }
  }

  /**
   * Accepts a travel rule and iterates through the service travel options to find the one mode in the rule
   * whos travel properties meet all of the state travel options.
   *
   * It is possible that multiple modes will match. This function however, will only return the first occurrence, if any.
   *
   * @param {TripPlannerRule} rule - Valid trip planner rule
   * @param {Boolean} [numberOnly] - Determines if the return value will be the matched mode object or only its mode value as a number.
   * Default to `false`
   * @returns {*}
   * @memberof TripPlannerService
   */
  public getTravelModeFromRule(rule: TripPlannerRule, numberOnly?: false): TripPlannerRuleMode;
  public getTravelModeFromRule(rule: TripPlannerRule, numberOnly?: true): number;
  public getTravelModeFromRule(rule: TripPlannerRule, numberOnly?: Boolean): any {
    // Reduce travel options to only that that are enumerable. This will leave behind only options that can
    // be simply checked against truthy/falsy values by virtue of sipmly existing in the travel mode.
    //
    // Condition is set in the travel mode (e.g. accessible = true). That condition must be met in state
    // value to be eligible to become a potential mode result. If the state condition is not met, it is rejected.
    const rootConditions = Object.keys(this._TravelOptions.value).reduce((acc, curr, index) => {
      if (rule.constraints.includes(curr)) {
        acc[curr] = this._TravelOptions.value[curr];

        return acc;
      } else {
        return acc;
      }
    }, {});

    const ruleModes = this.flattenRule(rule);

    // Limit the modes to a list of qualifying modes based on travel option constraint values.
    const qualifying = ruleModes.filter((mode) => {
      const passAllConditions = Object.keys(rootConditions).every((condition) => {
        const modeOptions = mode.determinants;

        // From the enumerable root travel options/conditions, get what the value of the current condition
        // shoudl be.
        const whatValueShouldBe = rootConditions[condition];

        // For the current mode get its value for the current condition.
        //
        // If the current mode does not contain modeOptions AND it does not contain the current condition,
        // default to `false`
        let whatValueIs;

        // If modeOptions and it contains the current condition, continue testing.
        if (modeOptions && modeOptions[condition]) {
          // If the condition value for the current mode is of type Array,
          // assume any of the values in the Array are valid.
          if (modeOptions[condition] instanceof Array) {
            // Test if any of the conditions are valid set the value to be true.
            whatValueIs = modeOptions[condition].find((c) => {
              return c === whatValueShouldBe;
            });
          } else {
            // If the condition value for the current mode is not of type Array,
            // Test if the state constraint value is same as the mode requirement.
            whatValueIs = modeOptions[condition];
          }
        } else {
          // Else fail out.
          whatValueIs = false;
        }

        if (whatValueShouldBe === whatValueIs) {
          return true;
        } else {
          return false;
        }
      });

      // If the current mode passed all conditions, return true.
      // Will collect in the filter function.
      return passAllConditions;
    });

    // If the qualifying mode count is greater than 0, return the first one.
    // Otherwise, return undefined to signal for no matched modes meeting all
    // conditions.
    if (qualifying.length > 0) {
      if (qualifying.length > 1) {
        console.warn(`More than one travel modes matched. Returning only first.`);
      }

      if (numberOnly) {
        return qualifying[0].mode;
      } else {
        return qualifying[0];
      }
    } else {
      return undefined;
    }
  }

  /**
   * Verifies if selected travel mode is accessible capable (e.g. There is no biking ADA mode)
   *
   * @returns {boolean} `true` if current travel mode is accessible OR has an associated accessible mode. `false` if not
   * @memberof TripPlannerService
   */
  public verifyRuleAccessibility(): boolean {
    const rule = this.getRuleForModes([this._TravelOptions.value.travel_mode]);
    const flattened = this.flattenRule(rule);

    if (flattened && flattened.some((mode) => mode.determinants && mode.determinants.accessible)) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Updates service travel options state from a provided travel mode.
   *
   * The travel rule is matched by provided mode, its modes and travel properties
   * scanned, and an object created with all properties that will be updated to reflect
   * the provided travel mode.
   *
   * This is used in URL trip loading where a travel mode is specified and the state and UI
   * needs to update to reflect all aspects of the provided travel mode.
   *
   * @param {number} mode
   * @memberof TripPlannerService
   */
  public setTravelOptionsForMode(mode: number): void {
    const rule = this.getRuleForModes([mode]);

    const modeFromRule = this.flattenRule(rule).find((m) => m.mode === mode);

    if (modeFromRule.determinants) {
      this.updateTravelOptions(modeFromRule.determinants);
    }
  }

  /**
   * Accepts and processes an array of TripPoint instances.
   *
   * Each point is normalized before the service state is updated.
   *
   * Once all points are normalized, the service state is set and points drawn.
   *
   * State setting triggers trip task execution.
   *
   * @param {TripPoint} stops TripPoint class instance
   * @memberof TripPlannerService
   */
  public setStops(stops: TripPoint[]): void {
    const updateStops = (nStops: TripPoint[]) => {
      const allNormalized = nStops.every((s) => s.normalized);

      if (allNormalized) {
        this.getNearestDoors(nStops).then(() => {
          // Set the service state value, which notifies all subscribers.
          this.stops = nStops;

          // Send stops to map service to get drawn.
          this.drawPoints(nStops);
        });
      } else {
        // Set the service state value, which notifies all subscribers.
        this.stops = nStops;

        // Send stops to map service to get drawn.
        this.drawPoints(nStops);
      }
    };

    // Create a new stop array from the local store
    const stateStops = Array.from(this._Stops.getValue());

    stops.forEach((stop, index, arr) => {
      // Handle the trip point object, and normalize it before adding it to the store
      stop.normalize();

      if (stop.index !== undefined) {
        stateStops[stop.index] = stop;

        // Since we are dealing with an array, we want to deffer updating the state until the
        // last stop has been processed. Otherwise, we would be running multiple parallel trip queries,
        // which we don't want
        if (index === arr.length - 1) {
          updateStops(stateStops);
        }
      } else {
        // Find the first index of a stop in the store that does not have a set name.
        // If this is the case, then it will be overwritten by the normalized TripPoint.
        const indexFirstDefault = stateStops.findIndex((tp) => {
          return !tp.attributes || (tp.attributes && tp.attributes.name === '');
        });

        if (indexFirstDefault > -1) {
          // Set by reference. This is potentially dangerous.
          stateStops[indexFirstDefault] = Object.assign(stop, { index: indexFirstDefault });

          // Since we are dealing with an array, we want to deffer updating the state until the
          // last stop has been processed. Otherwise, we would be running multiple parallel trip queries,
          // which we don't want
          if (index === arr.length - 1) {
            updateStops(stateStops);
          }
        }
      }
    });
  }

  /**
   * Handles launching the actual trip calculation request.
   *
   * If all stop instances are populated and have been normalized run the trip task.
   *
   * If at least one of the stop instances has not been normalized, do not run the trip task.
   *
   * @private
   * @memberof TripPlannerService
   */
  private executeTripTask() {
    try {
      if (this._Stops && this._Stops.getValue() && this._Stops.getValue().every((stop) => stop.normalized)) {
        // Get qualifying travel modes beased on state settings.
        const modes = this.getQualifyingTravelModes().sort((a, b) => {
          return a.mode - b.mode;
        });

        const modeNumbers = modes.map((m) => m.mode);

        // Determine whether the trip task execution was triggered by a UI travel mode change.
        //
        // If it was, determine if the qualifying travel modes are the same as of the result
        // travel modes. If they are, then we already have the values and there is no need to
        // fire off a separate set of requests.
        //
        const executionTriggeredByModeChange =
          this._Result.value.length > 0
            ? this._Result.value.every((r) => {
                return r && r.params && r.params.travelMode
                  ? modeNumbers.includes(parseInt(r.params.travelMode, 10))
                  : false;
              })
            : false;

        if (executionTriggeredByModeChange) {
          return;
        }

        // Set initial result state. This is just to display loading status in the UI.
        this.result = modes.map((result) => {
          return new TripResult({
            connection: this.connection,
            stopsSource: undefined,
            stops: undefined,
            isProcessing: true,
            isError: false,
            params: new this._Modules.TripParameters({
              outSpatialReference: {
                wkid: 4326
              },
              stops: undefined,
              travelMode: result.mode
            })
          });
        });

        let previousState;

        const tasks = from(modes).pipe(
          mergeMap((mode) => {
            // For each of the qualifying travel modes, determine if they have determinat properties that
            // will require pre-processing before the trip request. Such determinants include parking pass,
            // and bike share, in which an intermediary point needs to be calculated to be included in the trip
            // request to be calculated by the routing network.
            if (!mode || !mode.determinants) {
              return of({
                mode,
                stops: this._Stops.getValue().map((stop) => stop)
              });
            }

            if (mode.determinants && mode.determinants.bike_share) {
              const stops = this._Stops.getValue().map((stop) => stop);

              // Return the service stops with an added  point of the nearest bike rack to the start point.
              return this.bikeService
                .getNearestBikeRack({
                  latitude: stops[0].geometry.latitude,
                  longitude: stops[0].geometry.longitude
                })
                .pipe(
                  switchMap((result) => {
                    // If no result, return with existing stops
                    if (!result) {
                      return of({
                        mode,
                        stops
                      });
                    }

                    // If nearby bike returns a result, compose a trip point with its location
                    // and splice it into the other stops.
                    const bikeStop = new TripPoint({
                      source: 'coordinates',
                      originGeometry: {
                        latitude: result.latitude,
                        longitude: result.longitude
                      },
                      originParameters: {
                        type: 'coordinates',
                        value: {
                          latitude: result.latitude,
                          longitude: result.longitude
                        }
                      },
                      exportable: false
                    }).normalize();

                    stops.splice(1, 0, bikeStop);

                    return of({
                      mode,
                      stops
                    });
                  })
                );
            } else if (
              mode.determinants &&
              mode.determinants.parking_pass &&
              this._TravelOptions.getValue().parking_pass_permit !== ''
            ) {
              // Return the service stops with an added  point of the location of the nearest permitted parking lot/deck
              // based on their set parking permit preferences.
              //
              // If no parking permit preferences have been set, do not calculate the location of the parking lot/deck
              return this.parkingService
                .getAuthorizedParkingLocations(this._TravelOptions.getValue().parking_pass_permit)
                .pipe(
                  switchMap((result) => {
                    const stops = this._Stops.getValue().map((stop) => stop);

                    // If no result, return with existing stops
                    if (!result) {
                      return of({
                        mode,
                        stops
                      });
                    }

                    const centroids = result.map((f) => {
                      return {
                        geometry: {
                          latitude: (<esri.geometryPolygon>f.geometry).centroid.latitude,
                          longitude: (<esri.geometryPolygon>f.geometry).centroid.longitude
                        }
                      };
                    });

                    const nearest = findNearestIndex(
                      {
                        latitude: stops[stops.length - 1].geometry.latitude,
                        longitude: stops[stops.length - 1].geometry.longitude
                      },
                      centroids
                    );

                    const nearestGeometry = {
                      latitude: (<esri.geometryPolygon>result[nearest].geometry).centroid.latitude,
                      longitude: (<esri.geometryPolygon>result[nearest].geometry).centroid.longitude
                    };

                    // If nearby bike returns a result, compose a trip point with its location
                    // and splice it into the other stops.
                    const parkingStop = new TripPoint({
                      source: 'coordinates',
                      originAttributes: result[nearest].attributes as any,
                      originGeometry: { ...nearestGeometry },
                      originParameters: {
                        type: 'coordinates',
                        value: { ...nearestGeometry }
                      },
                      exportable: false
                    }).normalize();

                    stops.splice(1, 0, parkingStop);

                    return of({
                      mode,
                      stops
                    });
                  })
                );
            } else {
              return of({
                mode,
                stops: this._Stops.getValue().map((stop) => stop)
              });
            }
          }),
          switchMap((stopsAndMode) => {
            const trip = new TripResult({
              connection: this.connection,
              stopsSource: stopsAndMode.stops.map((stop) => stop.originParameters),
              stops: stopsAndMode.stops.map((stop) => stop),
              isProcessing: true,
              isError: false,
              params: new this._Modules.TripParameters({
                outSpatialReference: {
                  wkid: 4326
                },
                stops: new this._Modules.FeatureSet({
                  features: stopsAndMode.stops.map((feature) => {
                    return new this._Modules.Graphic({
                      attributes: {
                        // This attribute is used to identify which result belongs to each class once requests
                        // are resolved
                        routeName: stopsAndMode.mode.mode,
                        stopName: feature.attributes.name
                        // stopName: feature.attributes.name
                      },
                      geometry: {
                        type: 'point',
                        latitude: feature.geometry.latitude,
                        longitude: feature.geometry.longitude
                      }
                    });
                  })
                }),
                travelMode: stopsAndMode.mode.mode,
                returnDirections: true,
                returnZ: false
              }),
              modeSource: stopsAndMode.mode
            });

            return of(trip);
          }),
          switchMap((trip) => {
            // If the current trip does not have a split definition, return a
            // single formed task.
            if (!trip.modeSource || !trip.modeSource.split) {
              const t = [
                {
                  task: new this._Modules.TripTask({
                    url: this.connection.url()
                  }),
                  params: new this._Modules.TripParameters({
                    outSpatialReference: {
                      wkid: 4326
                    },
                    stops: new this._Modules.FeatureSet({
                      features: trip.stops.map((feature) => {
                        return new this._Modules.Graphic({
                          attributes: {
                            routeName: trip.modeSource.mode,
                            stopName: feature.attributes.name
                          },
                          geometry: {
                            type: 'point',
                            latitude: feature.geometry.latitude,
                            longitude: feature.geometry.longitude
                          }
                        });
                      })
                    }),
                    travelMode: trip.params.travelMode,
                    returnDirections: true,
                    returnZ: false
                  })
                }
              ];

              return of({
                trip,
                tasks: t
              });
            } else {
              // If the current trip HAS a split definition, create tasks starting with the current trip
              // travel mode and default to the defined inverse.

              const pairedFeatures = pairwiseOverlap(trip.stops);

              // Create a collection of tasks and parameters for every set of paired features. These will be used
              // in the execution of a RouteTask.
              const t = pairedFeatures.map((stops, index) => {
                const travelMode = index === 0 ? trip.modeSource.mode : trip.modeSource.split.default;

                return {
                  task: new this._Modules.TripTask({
                    url: this.connection.url()
                  }),
                  params: new this._Modules.TripParameters({
                    outSpatialReference: {
                      wkid: 4326
                    },
                    stops: new this._Modules.FeatureSet({
                      features: stops.map((feature) => {
                        return new this._Modules.Graphic({
                          attributes: {
                            routeName: trip.modeSource.mode,
                            stopName: feature.attributes.name
                          },
                          geometry: {
                            type: 'point',
                            latitude: feature.geometry.latitude,
                            longitude: feature.geometry.longitude
                          }
                        });
                      })
                    }),
                    travelMode: travelMode,
                    returnDirections: true,
                    returnZ: false
                  })
                };
              });

              return of({
                trip,
                tasks: t
              });
            }
          }),
          toArray(),
          tap((res) => {
            this.result = res.map((r) => r.trip);

            // TODO: Figure out a way to get rid of this dependency
            // This action stores the created in-process trip results. The parameters in them are used to create
            // `RouteTasks` which return `RouteResult`. Because of this, this allows determining which resolved (success or error) trip
            // result can be matched with the `previousState` to update the service state whin in turn updates any
            // subscribed UI components.
            previousState = res.map((r) => r.trip);
          })
        );

        /**
         * Executes the trip request.
         *
         * Handles success and fail cases to their respective service class members.
         *
         */
        combineLatest([
          tasks.pipe(
            mergeMap((trips) => {
              return from(trips);
            }),
            mergeMap((rq) => {
              // Create as many trip tasks/requests as there are in any given trip result (processing and unresolved status at this point).
              // Complete all inner trip requests for any given trip result before emitting.
              return forkJoin([
                from(rq.tasks).pipe(
                  concatMap((t) => {
                    // Execute inner trip task with own trip params
                    return from(t.task.solve(t.params)).pipe(
                      catchError((err): any => {
                        // Get the travel mode for the failed request found in the error object.
                        const responseTravelMode = err.details.requestOptions.query.travelMode;

                        // Find the matching result base don the response travel mode.
                        const matchedResult = previousState.find((r) => r.params.travelMode === responseTravelMode);

                        return of(
                          new TripResult({
                            ...matchedResult,
                            isError: true,
                            isProcessing: false,
                            error: err,
                            isFulfilled: true
                          })
                        );
                      })
                    );
                  }),
                  toArray()
                )
              ]);
            }),
            mergeMap((responses) => {
              const results: any = responses.flat();

              // If any one of the route result responses at this stage is of type TripResult, it is a result an error condition.
              const anyError = results.find((r) => r instanceof TripResult);

              // Handle any trip results error=ing out.
              if (anyError) {
                // Make shallow copy of response trip result.
                // This already contains the trip result error.
                const failedResult = new TripResult(results[0]);

                // Report failed trip result.
                this.tripTaskFail(failedResult);

                return of(failedResult);
              }

              // Handle single-request trip results
              if (results.length <= 1) {
                return of(results[0]);
              } else {
                // Handle multi-request trip results
                const merged = results.reduce(
                  (result, curr) => {
                    result.routeName = curr.routeResults[0].routeName;
                    result.directions.totalDriveTime += curr.routeResults[0].directions.totalDriveTime;
                    result.directions.totalLength += curr.routeResults[0].directions.totalLength;
                    result.directions.totalTime += curr.routeResults[0].directions.totalTime;

                    result.directions.features = [
                      ...result.directions.features,
                      ...curr.routeResults[0].directions.features
                    ];

                    return result;
                  },
                  { directions: { features: [], totalDriveTime: 0, totalLength: 0, totalTime: 0 }, routeName: undefined }
                );

                return of({
                  routeResults: [merged]
                });
              }
            }),
            mergeMap((response) => {
              if (response instanceof TripResult && response.isError) {
                return of(response);
              } else {
                // If request was successful, value will be TripTask result. In which case, create a new Trip Result
                // and append the result property
                const matchedResult = previousState.find(
                  (r) => r.params.travelMode.toString() === (<any>response).routeResults[0].routeName
                );

                return of(true).pipe(
                  switchMap(
                    (): Observable<TripModeSwitch[]> => {
                      return of(
                        (response as RouteResult).routeResults[0].directions.features.reduce(
                          (acc, curr): TripModeSwitch[] => {
                            // Determine the speed category for the current feature.
                            const currFeatureSpeedCategory = this.speed(curr);

                            // Stores a index reference to the most recently modified accumulated mode switch array, if any.
                            // This is used to test against current feature speed categories and appending.
                            const newestAccumulatedIndex = acc.length > 0 ? acc.length - 1 : 0;

                            // Using newestAccumulatedIndex, stores reference to the actual array object.
                            const newestAccumulated: TripModeSwitch = acc[newestAccumulatedIndex];

                            // If the current graphic has the same speed category as the last accumulated mode switch
                            // keep adding graphics to that object's `graphics` array.
                            if (newestAccumulated && newestAccumulated.type === currFeatureSpeedCategory) {
                              acc[newestAccumulatedIndex] = {
                                type: newestAccumulated.type,
                                graphics: [...newestAccumulated.graphics, curr]
                              } as TripModeSwitch;

                              // For the current mode switch, insert the current feature graphic into the graphics object.
                              return acc;
                            } else {
                              // If this block was entered, it means the current feature does not have the same speed category as the
                              // `newestAccumulatedIndex` (the last item in the accumulated array).
                              //
                              // This is either bause `newestAccumulatedIndex` is an array with zero mode switch objects and as such the `mode` (first route results feature being iterated)
                              // for the non-existent object is `undefined`. If this is the case, then the switch index should be zero, to add the first mode switch to the accumulated array.
                              //
                              // Alternatively, the current feature is of the opposing speed category (e.g. previous was walking, and is now not_walking).
                              // If this is the case, we want to add another mode switch on the index after the last mode switch. A simple n + 1. In this way, it will not overwrite the
                              // last mode switch.
                              const switchIndex =
                                newestAccumulated && newestAccumulated.type
                                  ? newestAccumulatedIndex + 1
                                  : newestAccumulatedIndex;

                              acc[switchIndex] = {
                                type: currFeatureSpeedCategory,
                                graphics: [curr]
                              } as TripModeSwitch;

                              // Return the mode switches array with a new mode switch object.
                              return acc;
                            }
                          },
                          []
                        )
                      );
                    }
                  ),
                  switchMap((modeSwitches: TripModeSwitch[]) => {
                    const baseDate =
                      this._TravelOptions.getValue().requested_time != null
                        ? new Date(this._TravelOptions.getValue().requested_time)
                        : new Date();
                    const { travelMode } = matchedResult.params;

                    let minutesToCur = 0;

                    return forkJoin([
                      from(modeSwitches).pipe(
                        concatMap((modeSwitch) => {
                          modeSwitch.graphics = modeSwitch.graphics.map((graphic: esri.Graphic) => {
                            graphic.attributes.relativeTime = minutesToCur;
                            graphic.attributes.dateToHere = new Date(baseDate.getTime() + minutesToCur * 60 * 1000);
                            minutesToCur = minutesToCur + graphic.attributes.time;

                            return graphic;
                          });

                          if (modeSwitch.type === 'not_walking') {
                            switch (this.getRuleForModes([parseInt(travelMode, 10)])) {
                              case this.rule_bus:
                                return this.busService.annotateBusGraphic(modeSwitch);
                              case this.rule_drive:
                              // TODO this.inrixService.annotateDriveFeature(graphic, modeSwitch, dateToHere).subscribe((f_new: esri.Graphic) => res(f_new)); break;
                              default:
                                return of(modeSwitch);
                            }
                          } else {
                            return of(modeSwitch);
                          }
                        }),
                        toArray()
                      ),
                      of(baseDate)
                    ]);
                  }),
                  switchMap((argument: [TripModeSwitch[], Date]) => {
                    const [modeSwitches, baseDate] = argument;

                    // Flatten the modeSwitches graphics.
                    const features = modeSwitches.reduce((acc, curr) => {
                      if (curr.graphics && curr.graphics.length > 0) {
                        return [...acc, ...curr.graphics];
                      } else {
                        return acc;
                      }
                    }, []);

                    const firstStopName = this._Stops.value[0].attributes.name;
                    const lastStopName = this._Stops.value[this._Stops.value.length - 1].attributes.name;

                    const firstTime = timeStringForDate(baseDate);
                    const lastTime = timeStringForDate(
                      new Date(baseDate.getTime() + features[features.length - 1].attributes.relativeTime * 60 * 1000)
                    );

                    // Setting the text on these should update the response directions as `features` are a reference to those.
                    if (this._TravelOptions.getValue().time_mode === 'arrive') {
                      features[0].attributes.text = `Start at ${firstStopName} at ${lastTime}`;

                      features[features.length - 1].attributes.text = `Finish at ${lastStopName} at ${firstTime}`;
                    } else {
                      features[0].attributes.text = `Start at ${firstStopName} at ${firstTime}`;

                      features[features.length - 1].attributes.text = `Finish at ${lastStopName} at ${lastTime}`;
                    }

                    const features_length = (<any>features).length;
                    // Overwrite total travel time to be the relative time of the last item in the features array.
                    // This ensures it applies the addtiional time padding such as bus linger time and traffic multipliers.
                    if (features_length > 0 && features[0].attributes.relativeTime != null) {
                      (<RouteResult>response).routeResults[0].directions.totalDriveTime =
                        features[features_length - 1].attributes.relativeTime;
                      (<RouteResult>response).routeResults[0].directions.totalTime =
                        features[features_length - 1].attributes.relativeTime;
                    }

                    if (modeSwitches && modeSwitches.length > 0) {
                      const anyHasResultLinger = modeSwitches.filter((ms) => {
                        return ms && ms.results && ms.results.bus;
                      });

                      if (anyHasResultLinger.length > 0) {
                        const totalLinger = modeSwitches.reduce((acc, curr) => {
                          if (curr.results && curr.results.bus) {
                            return acc + curr.results.bus.linger_minutes;
                          } else {
                            return acc;
                          }
                        }, 0);

                        (<RouteResult>response).routeResults[0].directions.totalDriveTime += totalLinger;
                        (<RouteResult>response).routeResults[0].directions.totalTime += totalLinger;
                      }
                    }

                    const timeMode = this._TravelOptions.getValue().time_mode || 'now';
                    const requestedTime = this._TravelOptions.getValue().requested_time;

                    const result = this.aggregateDirections(
                      new TripResult({
                        ...matchedResult,
                        result: response as RouteResult,
                        directions: (<RouteResult>response).routeResults[0].directions,
                        isProcessing: false,
                        isFulfilled: true,
                        modeSwitches: modeSwitches,
                        timeMode: timeMode,
                        requestedTime: requestedTime
                      })
                    );

                    // Report successful trip result.
                    this.tripTaskSuccess(result);

                    return of(result);
                  })
                );
              }
            }),
            scan((results: TripResult[], result: TripResult) => {
              // From the accumulated value, filter out those that are marked as fulfilled.
              const oldCompletedResults = results.filter((r) => r.isFulfilled);

              // Create new array with old completed results, appending the current completed result.
              const processed = [...oldCompletedResults, result];

              // From the previous state, which has all of the to-be-completed trip requests,
              // filter out those that are not in the old completed results plus current result.
              // These need to be provided in each source stream emission to allow components to
              // display the processing status, otherwise they will not provide feedback.
              const stillProcessing = previousState.filter(
                // Test every `previousState` TripResult to see if it exists in the `processed` list.
                //
                // If findIndex returns -1, it means that the iterating `previousState` TripResult item
                // does not exist in the `processed` list. If the value is less than 0, which -1 is, pass
                // the test, returning the iterating TripResult item.
                (r) => processed.findIndex((or) => or.params.travelMode === r.params.travelMode) < 0
              );

              // Return merged `processed` and `stillProcessing` arrays.
              return [...processed, ...stillProcessing];
            }, [])
          )
        ]).subscribe(
          // (res) => {
          //   console.log('emit');
          // })
          (res: Array<any>) => {
            this.result = res.flat();
          },
          (err) => {
            console.error(err);
          },
          () => {
            // Print out table of travel modes and speeds
            const results = [...this._Result.value];
            console.table(
              results.map((item) => {
                if (!item.error) {
                  return {
                    travelMode: item.params.travelMode,
                    speed:
                      item.result.routeResults[0].directions.totalLength /
                      (item.result.routeResults[0].directions.totalTime / 60),
                    totalTime: item.result.routeResults[0].directions.totalTime,
                    totalDistance: item.result.routeResults[0].directions.totalLength
                  };
                } else {
                  return {
                    travelMode: null,
                    speed: null,
                    totalTime: null,
                    totalDistance: null
                  };
                }
              })
            );

            console.log(results);
          }
        );
      }
    } catch (err) {
      throw new Error(err);
    }
  }

  /**
   * Callback executed after a successful trip task.
   *
   * Reports success status to Google Analytics.
   *
   * @private
   * @param {TripResult} result
   * @memberof TripPlannerService
   */
  private tripTaskSuccess(result: TripResult) {
    // Do not assign new this.result value here as it will be done further down the chain.

    // Route creation analytics tracking
    const label = {
      guid: guid(),
      date: Date.now(),
      points: result.stopsToArray(),
      travelMode: result.params.travelMode,
      connection: result.connection.name,
      tryCount: result.tryCount,
      stops: result.stopsSource
    };

    this.analytics.eventTrack.next({
      action: 'Create',
      properties: {
        category: 'Routing',
        label: JSON.stringify(label)
      }
    });
  }

  /**
   * Trip request failure handler. Attempts to identify if the failure was from an out of bounds condition,
   * or a network problem.
   *
   * Reports result to Google Analytics.
   *
   * @private
   * @param {TripResult} rs TripResult class instance containing error details
   * @memberof TripPlannerService
   */
  private tripTaskFail(rs: TripResult) {
    const tripResult = new TripResult(rs);

    try {
      const intersectionsWithinBrazos = tripResult.params.stops['features']
        .map((p) => {
          return gju.pointInPolygon(
            { type: 'Point', coordinates: [p.geometry.longitude, p.geometry.latitude] },
            brazosCounty.features[0].geometry
          );
        })
        .every((r) => r === true);

      if (intersectionsWithinBrazos) {
        // Both points are within the county
        // Route failure analytics tracking
        const label = {
          guid: guid(),
          date: Date.now(),
          httpStatus: tripResult.error.details.httpStatus,
          message: tripResult.error.message,
          points: tripResult.stopsToArray(),
          travelMode: tripResult.params.travelMode,
          connection: tripResult.connection.name,
          tryCount: tripResult.tryCount,
          stops: tripResult.stopsSource
        };

        this.analytics.eventTrack.next({
          action: 'Fail',
          properties: {
            category: 'Routing',
            label: JSON.stringify(label)
          }
        });
      } else {
        // At least one point is outside the county
        // Route failure analytics tracking
        const label = {
          guid: guid(),
          date: Date.now(),
          httpStatus: tripResult.error.details.httpStatus,
          message: tripResult.error.message,
          points: tripResult.stopsToArray(),
          travelMode: tripResult.params.travelMode,
          connection: tripResult.connection.name,
          tryCount: tripResult.tryCount,
          stops: tripResult.stopsSource
        };

        this.analytics.eventTrack.next({
          action: 'Out Of Bounds',
          properties: {
            category: 'Routing',
            label: JSON.stringify(label)
          }
        });
      }
    } catch (err) {
      // If the requests fail for whatever reason, still report it as a regular fail
      // Route failure analytics tracking
      const label = {
        guid: guid(),
        date: Date.now(),
        httpStatus: tripResult.error.details.httpStatus,
        points: tripResult.stopsToArray(),
        travelMode: tripResult.params.travelMode,
        connection: tripResult.connection.name,
        tryCount: tripResult.tryCount,
        stops: tripResult.stopsSource
      };

      this.analytics.eventTrack.next({
        action: 'Boundary Query Fail',
        properties: {
          category: 'Routing',
          label: JSON.stringify(label)
        }
      });
    }
  }

  /**
   * Fetch the trip result for the state set travel mode. In this step, apply transformations to trip result
   * such as direction aggregation, etc.
   *
   * At the end of the transformation pipeline, draws the trip result route.
   *
   * @returns
   * @memberof TripPlannerService
   */
  public getTripResultForTravelMode() {
    const qualifiying = this.getQualifyingTravelModes();

    // const calculatedMode = this.calculateScoredTravelMode(qualifiying);

    return this._Result.pipe(
      map((results) => {
        // Filter out only the trip result for the current state travel mode.
        return results.filter(
          (result) =>
            (result.params && result.params.travelMode.toString()) === this._TravelOptions.value.travel_mode.toString()
        );
      }),
      mergeMap((results) => {
        // If the previously filtered array length is zero, the trip result with the
        // the current state travel mode does not exist. Return an empty TripResult.
        //
        // The array length will be zero in cases where the TripResult array is reset by the user.
        //
        // In this case, all components that were previously showing information for a selected
        // trip result must be reset.
        //
        //
        // Else return the one and only item in the filtered array.
        return iif(() => results.length > 0, of(results[0]), of(new TripResult({})));
      }),
      tap((result) => {
        // Draw the trip route of the returned result.
        //
        // Nothing will draw if an empty trip result.
        return this.drawRoute(result);
      })
    );
  }

  /**
   * Accepts a TripPoint array, categorizes, and renders the trip points on the map while
   * applying the correct symbolgy (start, middle, end.
   *
   * @param {TripPoint[]} stops Trip stops array
   * @memberof EsriMapService
   */
  public drawPoints(stops: TripPoint[]) {
    const id = 'trip-points-layer';

    this.moduleProvider
      .require(['GraphicsLayer', 'Graphic', 'Point'])
      .then(
        ([GraphicsLayer, Graphic, Point]: [
          esri.GraphicsLayerConstructor,
          esri.GraphicConstructor,
          esri.PointConstructor
        ]) => {
          // Check map for existing trip points layer, to avoid creating multiple layers.
          let layer = <esri.GraphicsLayer>this._map.findLayerById(id);

          if (!layer) {
            layer = new GraphicsLayer({
              id: id,
              title: 'Trip Points',
              listMode: 'hide'
            });

            // Add layer to map, which will persist for the duration of the session
            this._map.add(layer);
          } else {
            // If layer exists, it's very likely it already has some trip points; clear them.
            layer.removeAll();
          }

          const symbologies = {
            start: {
              type: 'simple-marker',
              style: 'circle',
              size: 8,
              outline: {
                width: 2
              }
            },
            middle: {
              type: 'simple-marker',
              style: 'circle',
              size: 8,
              color: '#500000'
            },
            end: {
              type: 'simple-marker',
              style: 'circle',
              size: 15,
              color: '#500000',
              path:
                'M38.9,5.3L38.9,5.3c-7.1-7.1-18.6-7.1-25.7,0l0,0C6.8,11.7,6,23.8,11.5,31L26,52l14.5-21C46,23.8,45.2,11.7,38.9,5.3z M26.2,24c-3.3,0-6-2.7-6-6s2.7-6,6-6s6,2.7,6,6S29.5,24,26.2,24z'
            }
          };

          /**
           * Generates trip point graphic using stop TripPoint and string symbol reference
           * to copy-pasing the same logic into each case.
           *
           * @param {TripPoint} stop
           * @param {string} symbolRef
           * @returns {esri.Graphic}
           */
          const makeGraphic = (stop: TripPoint, symbolRef: string): esri.Graphic => {
            return new Graphic({
              attributes: stop.attributes,
              symbol: symbologies[symbolRef],
              geometry: new Point({
                latitude: stop.geometry.latitude,
                longitude: stop.geometry.longitude
              })
            });
          };

          // Generate a graphic with the correct symbology depending on the stop index. Rules:
          // 1. Three types of stops (symbology): start, middle, and end
          // 2. Array length === 1, there is only a start point
          // 3. Array length === 2, first item is start and second item is end
          // 4. Array length > 2, first item is start, last item is end, any the rest in between are middle points
          const graphics = stops
            .filter((stop) => stop.normalized)
            .map((stop, index, arr) => {
              if (arr.length === 1) {
                return makeGraphic(stop, 'start');
              } else if (arr.length === 2) {
                if (index === 0) {
                  return makeGraphic(stop, 'start');
                } else if (index === 1) {
                  return makeGraphic(stop, 'end');
                }
              } else if (arr.length > 2) {
                if (index === 0) {
                  return makeGraphic(stop, 'start');
                } else if (index < arr.length - 1) {
                  return makeGraphic(stop, 'middle');
                } else if (index === arr.length - 1) {
                  return makeGraphic(stop, 'end');
                }
              }
            });

          layer.addMany(graphics);
        }
      );
  }

  /**
   * Returns travel mode based on provided graphic length and time properties and a fixed threshold value
   *
   * @param {esri.Graphic} el Route result graphic
   * @returns {string} String representation of travel mode. Either `walking` or `not_walking`
   */
  private speed(el: esri.Graphic): 'not_walking' | 'walking' {
    return el.attributes.length / el.attributes.time >= 0.09 ? 'not_walking' : 'walking';
  }

  /**
   * Processes and shows route result in segments based on travel mode
   *
   * @param {RouteResult} result Route result returned by a successful route transaction
   */
  public drawRoute(result: TripResult) {
    // If there is no result provided, return early.
    if (!result.result) {
      return result;
    }

    const routeSegments = [];
    const graphicCollection: esri.Graphic[] = [];

    /**
     * Group of paths that have been identified as a separate travel mode,
     * populate their respective container created by createObject()
     *
     * @param {Array<{}>} paths Array of X,Y location pair objects
     * @param {number} index Route segment index reference. If it doesn't exist, one will be created
     */
    const pathGroups = (paths: [][], index: number) => {
      routeSegments[index] = {
        mode: this.speed(result.result.routeResults[0].directions.features[index]),
        paths: paths
      };
    };

    result.result.routeResults[0].directions.features.forEach((el, i, arr) => {
      // If not the first element and mode is the same, append all
      if (i !== 0 && this.speed(arr[i]) === routeSegments[routeSegments.length - 1].mode) {
        routeSegments[routeSegments.length - 1].paths.push(...el.geometry.paths[0]);
      } else {
        pathGroups([...el.geometry.paths[0]], i);
      }
    });

    this.moduleProvider
      .require(['GraphicsLayer', 'Graphic', 'SimpleLineSymbol', 'Polyline', 'Point'])
      .then(
        ([GraphicsLayer, Graphic, SimpleLineSymbol, Polyline]: [
          esri.GraphicsLayerConstructor,
          esri.GraphicConstructor,
          esri.SimpleLineSymbolConstructor,
          esri.PolylineConstructor,
          esri.PointConstructor
        ]) => {
          const id = 'route-segments-layer';

          let layer = <esri.GraphicsLayer>this._map.findLayerById(id);

          if (!layer) {
            // Make new graphics layer
            layer = new GraphicsLayer({
              id: id,
              title: 'Trip Route',
              listMode: 'hide'
            });

            // Add layer to map, which will persist for the duration of the session
            this._map.add(layer);
          } else {
            // If the route segments layer exists, there's a possibility of it already containing segments;
            // clear them in preparation for the new segments.
            layer.removeAll();
          }

          const routeSymbols = {
            walk_2d: {
              id: 'walking',
              type: 'simple-line',
              color: '#2979FF',
              width: 5,
              style: 'short-dot',
              cap: 'round'
            },
            not_walk_2d: {
              id: 'not_walking',
              type: 'simple-line',
              color: '#FF5252',
              width: 4
            },
            walk_3d: {
              id: 'walking',
              type: 'line-3d',
              symbolLayers: [
                {
                  type: 'path',
                  size: 2,
                  material: { color: '#F44336' }
                }
              ]
            },
            not_walk_3d: {
              id: 'not_walking',
              type: 'line-3d',
              symbolLayers: [
                {
                  type: 'path',
                  size: 2,
                  material: { color: '#F44336' }
                }
              ]
            }
          };

          /**
           * Returns route segment symbology for appropriate travel mode and view type.
           *
           * @param {string} mode
           * @returns {(esri.Symbol3DProperties | esri.SymbolProperties)}
           */
          const getSymbol = (mode: 'walking' | 'not_walking'): esri.Symbol3DProperties | esri.SymbolProperties => {
            if (this._view.type === '2d') {
              return mode === 'not_walking' ? routeSymbols.not_walk_2d : routeSymbols.walk_2d;
            } else if (this._view.type === '3d') {
              return mode === 'not_walking' ? routeSymbols.walk_3d : routeSymbols.walk_3d;
            }
          };

          // For each route segment, clone the graphic template and attach segment geometry, symbol, and id
          routeSegments.forEach((el) => {
            const graphic: esri.Graphic = new Graphic({
              geometry: new Polyline({
                spatialReference: {
                  wkid: 4326
                },
                paths: el.paths
              }),
              symbol: getSymbol(el.mode)
            });

            graphicCollection.push(graphic);
          });

          // Add all graphics generated from the route segments.
          layer.addMany(graphicCollection);

          this.computeZoomLevel(graphicCollection).then((zoom) => {
            this._view.goTo(
              {
                target: graphicCollection,
                zoom: zoom
              },
              {
                animate: true
              }
            );
          });

          this.busService.removeAllFromMap();

          const bus_features = result.result.routeResults[0].directions.features.filter(
            (feature) => feature.attributes.bus != null
          );
          // Only show buses if we are viewing the bus mode and the time mode is now (don't have historical or projected data for buses)
          if (bus_features.length > 0 && result.timeMode === 'now') {
            bus_features.forEach((feature) => {
              this.busService.toggleMapRoute(feature.attributes.bus.route_number, ['buses']);
            });
          }

          // this.aggregateDirections(result.result.routeResults[0].directions)
          //   .then((res: esri.DirectionsFeatureSet) => {
          //     // Create new result with included directions
          //     const routeWithDirections = Object.assign(result, { directions: res });

          //     // Set new TripResult with directions in the store, notifying all subscribers
          //     this.result = routeWithDirections;

          //   })
          //   .catch((err) => {
          //     throw new Error(err);
          //   });
        }
      );
  }

  /**
   * Remove the drawn route segments from the map.
   *
   * Removes the drawn trip points.
   *
   * Resets the service stops with empty instances.
   *
   * Clears the active result.
   *
   * @memberof TripPlannerService
   */
  public clearAll(): void {
    this.clearRoute();
    this.clearAllStops();
    this.clearResult();
  }

  /**
   * Removes the drawn route segments from the map.
   *
   *
   * @memberof TripPlannerService
   */
  public clearRoute(): void {
    const id = 'route-segments-layer';

    if (!this._map) {
      return;
    }

    const layer = <esri.GraphicsLayer>this._map.findLayerById(id);

    if (layer) {
      layer.removeAll();
    }
  }

  /**
   * Sets the service result to an empty instance, notifying all subscribers.
   *
   * @memberof TripPlannerService
   */
  private clearResult(): void {
    this.result = [new TripResult({})];
  }

  /**
   * Sets visibilty of a draw map trip point to false at the provided index, to remove it from view.
   *
   * The stop is instead not deleted, because other component states may still contain the original reference.
   * On subsequent task queries, the array indexing must be preserved
   *
   * @param {number} index
   * @returns
   * @memberof TripPlannerService
   */
  public clearStopAt(index: number): void {
    const id = 'trip-points-layer';

    const layer = <esri.GraphicsLayer>this._map.findLayerById(id);

    if (layer) {
      const graphicsCount = layer.graphics.length;

      // Three cases, where the provided input index may not be representative of the stop index.
      //
      // 1. There are no stops
      // 2. There is only one item
      // 3. There are multiple stops

      if (graphicsCount === 0) {
        return;
      } else if (graphicsCount === 1) {
        layer.graphics.getItemAt(0).visible = false;
      } else if (graphicsCount > 1) {
        layer.graphics.getItemAt(index).visible = false;
      }

      if (graphicsCount >= 1) {
        this.setStops([new TripPoint({ index: index, source: 'search' })]);

        this.clearRoute();

        this.clearResult();
      }
    }
  }

  /**
   * Remove all stops from the map.
   *
   * Clears the route from the map, since there are no endpoitns left.
   *
   * Clears the result.
   *
   * @memberof TripPlannerService
   */
  public clearAllStops(): void {
    const id = 'trip-points-layer';

    const layer = <esri.GraphicsLayer>this._map.findLayerById(id);

    if (layer) {
      layer.graphics.removeAll();
    }

    this.stops = this.generateEmptyDefaultStops();

    this.clearRoute();
  }

  /**
   * Generates empty default stops.
   *
   * Default nuber of stops is 2, one start and one end.
   *
   * @private
   * @returns {TripPoint[]}
   * @memberof TripPlannerService
   */
  private generateEmptyDefaultStops(): TripPoint[] {
    return new Array(2).fill(undefined).map((e, i) => {
      return new TripPoint({
        index: i,
        source: ''
      });
    });
  }

  /**
   * From a trip result, groups written directions by maneuver
   * type to reduce verbosity while preserving integrity.
   *
   * @private
   * @memberof TripPlannerService
   */
  private aggregateDirections(result: TripResult): TripResult {
    if (!result.directions) {
      return result;
    }

    try {
      const aggregatedSwitches = result.modeSwitches.map(
        (modeSwitch): TripModeSwitch => {
          const route = [];
          const directions = [];

          // Create an array of cloned features from the modeSwitch array.

          // From this point on, graphic features will not be references to the `results` object in the trip result.
          const modeSwitchFeatures = modeSwitch.graphics.map((g) => g.clone());

          modeSwitchFeatures.forEach((feature, index, features) => {
            // Generate a potential guid that will be assigned to route segments and written directions items.
            const potentialGuid = guid();

            if (index === 0 || index === features.length - 1) {
              feature.attributes.guid = potentialGuid;

              route.push(feature);
              directions.push(feature);
            } else {
              // If current feature maneuver is of same type as last feature's,
              // combine their time and distance values.
              if (feature.attributes.maneuverType === directions[directions.length - 1].attributes.maneuverType) {
                const prev = directions[directions.length - 1];

                prev.attributes.length += feature.attributes.length;
                prev.attributes.time += feature.attributes.time;

                // Assign the current features guid to be the same as the last feature's.
                feature.attributes.guid = prev.attributes.guid;

                // Add the current feature to the route. We don't want to exclude any graphic items from the original route,
                // even if they are of the same maneuver type because we want to be able to draw the feature fully without gaps.
                //
                // However, this feature will have a binding guid to the matching directions item. This will allow future feature such as
                // segment highlighting on direction mouse hover.
                route.push(feature);
              } else {
                feature.attributes.guid = potentialGuid;

                route.push(feature);
                directions.push(feature);
              }
            }
          });

          return {
            ...modeSwitch,
            route,
            directions
          };
        }
      );

      return new TripResult({ ...result, modeSwitches: aggregatedSwitches });
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * Attempts to execute trip task from URL parameters
   *
   * @memberof TripPlannerService
   */
  public loadTripFromURL() {
    // Check if mode is set in URL params.
    if (this.url.snapshot.queryParams.mode) {
      // Store mode from URL
      const urlMode: number = parseInt(this.url.snapshot.queryParams.mode, 10);

      // Test if a rule with the given mode exists
      const rule = this.getRuleForModes([urlMode]);

      // If the provided urlMode is valid, continue.
      if (rule) {
        // Update travel mode
        this.updateTravelOptions({ travel_mode: urlMode });

        this.setTravelOptionsForMode(urlMode);
      } else {
        this.ns.preset('trip_fail');
      }
    }

    if (this.url.snapshot.queryParams.time) {
      this.updateTravelOptions({ time_mode: this.url.snapshot.queryParams.time });
    }

    if (this.url.snapshot.queryParams.at) {
      this.updateTravelOptions({ requested_time: new Date(this.url.snapshot.queryParams.at) });
    }

    // Check if trip stops are set in URL params
    if (this.url.snapshot.queryParams.stops && this.url.snapshot.queryParams.stops.length > 0) {
      // Convert params string to an array
      const blocks = this.url.snapshot.queryParams.stops.split('@').filter((p) => p.length > 0);

      // Identify a param block as either feature abbreviation/number OR coordinate point
      const identifyBlock = (block: string): TripPointProperties['source'] => {
        if (isCoordinatePair(block)) {
          // If block is coordinate, coordinate poitns will be intersected to determine if a feature
          return 'url-coordinates';
        } else if (block.includes('whereeveriam')) {
          return 'url-geolocation';
        } else {
          // If block is a feature, it will query a feature search.
          return 'url-query';
        }
      };

      // Categorize blocks for querying.
      const categorizedBlocks: Array<any> = blocks.map((block, index) => {
        return {
          category: identifyBlock(block),
          index: index,
          value: block
        };
      });

      // Group together only coordinate blocks.
      const categorizedCoordBlocks = categorizedBlocks.filter((b) => b.category === 'url-coordinates');

      // Group together only geolocation blocks.
      const categorizedGeolocationBlocks = categorizedBlocks.filter((b) => b.category === 'url-geolocation');

      // Group together only query blocks.
      const categorizedQueryBlocks = categorizedBlocks.filter((b) => b.category === 'url-query');

      // For any query blocks, collect them together and perform a search many sources with the same search term.
      // Generate a trip point array from the search results.
      const queryCategory = of(categorizedQueryBlocks).pipe(
        switchMap((blks) => {
          if (blks.length > 0) {
            return this.search.search({
              sources: Array(blks.length).fill('building'),
              values: blks.map((unit) => unit.value),
              returnObservable: true
            });
          } else {
            throwError('No query categories.');
          }
        }),
        map((res: SearchResult) => {
          return res.results.map((result: SearchResultItem, index) => {
            return new TripPoint({
              index: categorizedQueryBlocks[index].index,
              source: categorizedQueryBlocks[index].category,
              originAttributes: result.features[0].attributes,
              originGeometry: {
                raw: result.features[0].geometry
              },
              originParameters: {
                type: 'url-query',
                value: categorizedQueryBlocks[index].value
              }
            });
          });
        }),
        catchError(() => {
          return of([]);
        })
      );

      // For any query blocks, geolocation blocks perform a single geolocation check and generate trip points
      // using the same returned geolocation API response.
      const geolocationCategory = of(categorizedGeolocationBlocks).pipe(
        switchMap((blks): any => {
          if (blks.length > 0) {
            return getGeolocation(true);
          } else {
            throwError('No geolocation categories.');
          }
        }),
        map((coords: Coordinates) => {
          return categorizedGeolocationBlocks.map((block) => {
            return new TripPoint({
              index: block.index,
              source: block.category,
              originAttributes: {
                name: 'Current Location'
              },
              originGeometry: {
                latitude: coords.latitude,
                longitude: coords.longitude
              },
              originParameters: {
                type: 'url-geolocation',
                value: {
                  latitude: coords.latitude,
                  longitude: coords.longitude
                }
              }
            });
          });
        }),
        catchError(() => {
          return of([]);
        })
      );

      // For any coordinate blocks, generate trip points from the input values
      const coordCategory = of(categorizedCoordBlocks).pipe(
        map((blks) => {
          if (blks.length > 0) {
            return blks;
          } else {
            throwError('No coordinate categories.');
          }
        }),
        flatMap((block) => block),
        map((block) => {
          return new TripPoint({
            source: block.category,
            index: block.index,
            originAttributes: {
              name: block.value
            },
            originParameters: {
              type: 'url-coordinates',
              value: block.value
            }
          });
        }),
        toArray(),
        catchError(() => {
          return of([]);
        })
      );

      // Collect all category observables and proceed only after all have a value.
      zip(queryCategory, geolocationCategory, coordCategory).subscribe(
        (points) => {
          let stops = [];

          points.forEach((elems) => {
            stops = stops.concat(elems);
          });

          this.setStops(stops);
        },
        () => {
          // If there is an error in trip loading, throw a trip fail notification to the user.
          this.ns.preset('trip_fail');
        }
      );
    }
  }

  public computeZoomLevel(graphics: Array<esri.Graphic>): Promise<number> {
    return this.moduleProvider.require(['GeometryEngine', 'Point']).then(([GeometryEngine]: [esri.geometryEngine]) => {
      const geometries: esri.Geometry[] = graphics.map((graphic) => graphic.geometry);
      const result = GeometryEngine.union(geometries);

      const xMin = result.extent.xmin;
      const xMax = result.extent.xmax;
      const yMin = result.extent.ymin;
      const yMax = result.extent.ymax;

      // Get the view xmin and xmax distance in meters
      //
      //
      // const viewXMin = new Point({
      //   x: this._view.extent.xmax,
      //   y: this._view.extent.ymin,
      //   spatialReference: this._view.spatialReference
      // });

      // const viewXMax = new Point({
      //   x: this._view.extent.xmin,
      //   y: this._view.extent.ymin,
      //   spatialReference: this._view.spatialReference
      // });

      // const viewScreenPointXMin = this._view.toScreen(viewXMin);
      // const viewScreenPointXMax = this._view.toScreen(viewXMax);

      // const viewScreenXDiff = viewScreenPointXMin.x - viewScreenPointXMax.x;

      // const viewDistance = GeometryEngine.distance(viewXMin, viewXMax, 'meters');

      // Calculate feature x and set zoom modifier based on proportions of client device
      //
      //
      // const pointA = new Point({
      //   longitude: result.extent.xmax,
      //   latitude: result.extent.ymin,
      //   spatialReference: this._view.spatialReference
      // });

      // const pointB = new Point({
      //   longitude: result.extent.xmin,
      //   latitude: result.extent.ymin,
      //   spatialReference: this._view.spatialReference
      // });

      // const screenpointA = this._view.toScreen(pointA);
      // const screenpointB = this._view.toScreen(pointB);

      // const screenPointXDiff = screenpointA.x - screenpointB.x;

      // /**
      //  * Returns a zoom modifier value based on the current viewport to further provide a best
      //  * fit based on the device aspect ratio.
      //  *
      //  * @returns {number}
      //  */
      // const zoomModifier = (): number => {
      //   const screenWidth = this.responsiveService.snapshot.screenWidth;
      //   const difference = screenWidth - screenPointXDiff;

      //   if (difference > 0) {
      //     // Drawn route width is less than total devide width
      //     if (difference < screenWidth * .10) {
      //       return -1;
      //     } else if (difference >= screenWidth * .75) {
      //       return 1;
      //     } else {
      //       return 0;
      //     }
      //   } else if (difference < 0) {
      //     // Drawn route width is greater than total device width.
      //     return -1;
      //   }

      const xDiff = xMax - xMin;
      const yDiff = yMax - yMin;

      const maximum = Math.max(xDiff, yDiff);

      let zoom;

      if (maximum <= 0.0001) {
        zoom = 20;
      } else if (maximum > 0.0001 && maximum <= 0.00075) {
        zoom = 19;
      } else if (maximum > 0.00075 && maximum <= 0.002) {
        zoom = 18;
      } else if (maximum > 0.002 && maximum <= 0.005) {
        zoom = 17;
      } else if (maximum > 0.005 && maximum <= 0.01) {
        zoom = 16;
      } else if (maximum > 0.01 && maximum <= 0.02) {
        zoom = 15;
      } else if (maximum > 0.02 && maximum <= 0.03) {
        zoom = 14;
      } else if (maximum > 0.03 && maximum <= 0.06) {
        zoom = 13;
      } else if (maximum > 0.06 && maximum <= 1) {
        zoom = 12;
      }

      return zoom;
    });
  }

  /**
   * Accepts an array of TripPoints, performs an overlapping grouping function on the array,
   * and bootstraps a nearest door method for each trip point.
   *
   * @param {TripPoint[]} stops
   * @returns {Promise < TripPoint[] >}
   */
  public getNearestDoors(stops: TripPoint[]): Promise<TripPoint[]> {
    // Group all stops into overlapping sets of two. Resulting in an array of arrays that is of length n-1.
    // For example an input of 5 stops: [p1, p2, p3, p4, p5]
    // Results in a grouping: [[p1, p2], [p2, p3], [p3, p4], [p4, p5]]
    // This is necessary to calculate nearest door relative to a reference point
    const overlappedGroups: any = stops.reduce(
      (prev: TripPoint | TripPoint[], current: TripPoint, index: number, arr: TripPoint[]): any => {
        if (index === 1) {
          return [[prev, current]];
        } else if (index !== arr.length) {
          prev[index - 1] = [arr[index - 1], current];
          return prev;
        }
      }
    );

    const groupPromises: Array<Promise<TripPoint>> = overlappedGroups
      .map((group: TripPoint[], index: number) => {
        if (index === 0) {
          // In the first group, both points will be transformed
          if (index === 0) {
            return [
              this.findNearestDoorForTripPoint(group[0], group[1]),
              this.findNearestDoorForTripPoint(group[1], group[0])
            ];
          }
        } else {
          // On any other group other than the first, only the second point will be transformed, relative to the first.
          return this.findNearestDoorForTripPoint(group[1], group[0]);
        }
      })
      .reduce((acc, val) => acc.concat(val));

    return Promise.all(groupPromises);
  }

  /**
   * Accepts two trip points. The `stop` TripPoint is queried against the door service, by building number,
   * to determine if it has any associated doors.
   *
   * Each of the resulting door results is tested against the geometry of the `relativeTo` TripPoint to determine
   * which door in `stop` has the shortest straight-line distance to it.
   *
   * Criteria such as accessibilty and other categories are used to only test qualifying doors.
   *
   * If a matching door is found, its point geometry is used as the `stop` geometry.
   * The transformation is recorded in the `stop` originParameters transformations array.
   *
   * Any failure in the calculation chain results in the unadulterated `stop` TripPoint.
   *
   * @param {TripPoint} stop The trip stop that will be queried for doors and transformed if any matching door is found.
   * @param {TripPoint} relativeTo The trip point for which relative distance of all doors on the `stop`
   * will be calculated against.
   * @returns {Promise < TripPoint >}
   * @memberof TripPlannerService
   */
  public findNearestDoorForTripPoint(stop: TripPoint, relativeTo: TripPoint): Promise<TripPoint> {
    const source: LayerSource = LayerSources.find((s) => s.id === 'accessible-entrances-layer');

    return new Promise((resolve) => {
      try {
        const buildingNumber = (<any>stop.attributes).Bldg_Number;
        return this.mapService.findLayerOrCreateFromSource(source).then((layer: esri.FeatureLayer): any => {
          return layer
            .queryFeatures({
              where: `BldgNumber = '${buildingNumber}'`,
              returnGeometry: true,
              outSpatialReference: {
                wkid: 4326
              },
              outFields: ['*']
            })
            .then((res) => {
              // Filter out the doors that are suitable for routing depending on ADA routing mode
              return res.features.filter((door) => {
                // Door classifications
                //
                // 0= Non-Routable Entrance (Restricted, Courtyard)
                // 1= Non-ADA Entrance
                // 2= ADA Manual Entrance
                // 3= ADA Assisted/Automatic
                if (this._TravelOptions.value.accessible) {
                  return door.attributes.Routing_Class === 2 || door.attributes.Routing_Class === 3;
                } else {
                  return (
                    door.attributes.Routing_Class === 1 ||
                    door.attributes.Routing_Class === 2 ||
                    door.attributes.Routing_Class === 3
                  );
                }
              });
            })
            .then((doors) => {
              if (doors.length > 0) {
                // If doors found, find the one with shortest straight line distance from the provided point
                const distanceRef = [];
                const distanceValue = [];

                this.moduleProvider.require(['Point'], true).then((modules: { Point: esri.PointConstructor }) => {
                  doors.forEach((door) => {
                    // Point used to calculate euclidian distance between it and the reference point
                    const currentPoint = new modules.Point({
                      latitude: door.geometry['latitude'],
                      longitude: door.geometry['longitude']
                    });

                    const relativePoint = new modules.Point({
                      latitude: relativeTo.geometry.latitude,
                      longitude: relativeTo.geometry.longitude
                    });

                    distanceRef.push({
                      distance: currentPoint.distance(relativePoint),
                      fid: door.attributes['GIS.FCOR.Bldg_Entrance.FID']
                    });

                    distanceValue.push(currentPoint.distance(relativePoint));
                  });

                  // Get the index of the smallest value in the distances array
                  const min = minBy(distanceRef, (o) => {
                    return o.distance;
                  });

                  const ret: esri.Graphic = doors.find((feature) => {
                    return feature.attributes['GIS.FCOR.Bldg_Entrance.FID'] === min.fid;
                  });

                  const transformationDefinition: TripPointOriginTransformationsParams = {
                    type: 'nearest-door',
                    value: {
                      latitude: (<any>ret.geometry).latitude,
                      longitude: (<any>ret.geometry).longitude
                    }
                  };

                  // Return the door with the shortest calculated shortest distance
                  const transformed = stop;

                  transformed.addTransformation(transformationDefinition);
                  transformed.geometry.latitude = (<any>ret.geometry).latitude;
                  transformed.geometry.longitude = (<any>ret.geometry).longitude;

                  resolve(transformed);
                });
              } else {
                resolve(stop);
              }
            })
            .catch(() => {
              resolve(stop);
            });
        });
      } catch (err) {
        console.warn(`Potential error in nearest door: `, err.message);
        // If any error in the chain, resolve with the original stop;
        resolve(stop);
      }
    });
  }
}

/**
 * Interface extending esri's RouteResult, that includes the optional routeResults object.
 *
 * @export
 * @interface RouteResult
 * @extends {esri.RouteResult}
 */
export interface RouteResult extends esri.RouteResult {
  routeResults?: Array<any>;
}

/**
 * Interface extending esri's RouteParameters, that includes travelMode used in routing.
 *
 * @export
 * @interface RouteParameters
 * @extends {esri.RouteParameters}
 */
export interface RouteParameters extends esri.RouteParameters {
  travelMode: string;
}

/**
 * Trip result directions categorization based on speed used to bin segments to make determinations
 * based on the requested travel mode. The results of those determinations, if any, are stored in
 * the `results` object.
 *
 * @export
 * @interface TripModeSwitch
 */
export interface TripModeSwitch {
  /**
   * The speed category that describes a given mode switch.
   *
   * @type {('not_walking' | 'walking')}
   * @memberof TripModeSwitch
   */
  type: 'not_walking' | 'walking';

  /**
   * A collection of graphics indicating the beginning and end of a particular trip mode switch along
   * a series of trip result directions.
   *
   * These should not be used directly for user interface presentation. Instead, use either the `directions`
   * or `route` graphics.
   *
   * @type {esri.Graphic[]}
   * @memberof TripModeSwitch
   */
  graphics: esri.Graphic[];

  /**
   * Populated at the time of direction aggregation. Represents a list of aggregated directions, eaach
   * now possessing a unique identifier found in the route graphics which represent the guided instruction.
   *
   * @type {esri.Graphic[]}
   * @memberof TripModeSwitch
   */
  directions?: esri.Graphic[];

  /**
   * Populated at the time of direction aggregation. Represents a complete, un-collapsed, list of graphics
   * that make up the drawn trip route. Each contains a guid that can be related to the guided instruction
   * segment.
   *
   * @type {esri.Graphic[]}
   * @memberof TripModeSwitch
   */
  route?: esri.Graphic[];

  /**
   * The result of determination calculations, if any, based on the requested travel mode.
   *
   * For example, bus modes will typically include some bus scheduling properties that will be used
   * for UI display or futher calculations.
   *
   * @type {*}
   * @memberof TripModeSwitch
   */
  results?: any;
}

/**
 * Interface describing all pertinent initial and transformed values for a single trip request,
 * whether successful or unsuccessful.
 *
 * Used in TripResult class.
 *
 * @interface TripResultProperties
 */
export interface TripResultProperties {
  /**
   * Describes if the trip result is in a processing state.
   *
   * @type {boolean}
   * @memberof TripResultProperties
   */
  isProcessing?: boolean;

  /**
   * Describes if the trip result is in an erorred state.
   *
   * @type {boolean}
   * @memberof TripResultProperties
   */
  isError?: boolean;

  /**
   * If the trip request fails, property will be popluated with the error object.
   *
   * @type {*}
   * @memberof TripResultProperties
   */
  error?: any;

  /**
   * Reflects the finalized state of the result.
   *
   * Will be false for the duration of the trip task calculation cycle.
   *
   * Set to true once no further changes to the trip class instance will be made.
   * The task has either failed or succeeded and any new requests
   * will yield a new trip result.
   *
   *
   * @type {*}
   * @memberof TripResultProperties
   */
  isFulfilled?: any;

  /**
   * Describes the trip request attempt count at the point of an error or success.
   *
   * Useful metric determining the randomness, if any, if the routing network.
   *
   * @type {number}
   * @memberof TripResultProperties
   */
  tryCount?: number;

  /**
   * Original route parameteres used in the trip request.
   *
   * @type {RouteParameters}
   * @memberof TripResultProperties
   */
  params?: RouteParameters;

  /**
   * If trip request succeeded, property will be populated with aggregated directions.
   *
   * @type {esri.DirectionsFeatureSet}
   * @memberof TripResultProperties
   */
  directions?: esri.DirectionsFeatureSet;

  /**
   * If trip request succeeded, property will be populated with the result object.
   *
   * @type {RouteResult}
   * @memberof TripResultProperties
   */
  result?: RouteResult;

  /**
   * Instance of the trip planner connection used to perform the trip request against.
   *
   * @type {TripPlannerConnection}
   * @memberof TripResultProperties
   */
  connection?: TripPlannerConnection;

  /**
   * Cloned trip points used in the request.
   *
   * @type {TripPoint[]}
   * @memberof TripResultProperties
   */
  stops?: TripPoint[];

  /**
   * Trip point origins container as part of a singular trip task result.
   * Allows reporting the breadcrumb events for easier route replication.
   *
   * @type {TripPointOriginParams[]}
   * @memberof TripResultProperties
   */
  stopsSource?: TripPointOriginParams[];

  /**
   * Trip planner mode rule determined by the trip planner as the travel mode that is to be
   * used in executing the trip.
   *
   * @type {TripPlannerRuleMode}
   * @memberof TripResultProperties
   */
  modeSource?: TripPlannerRuleMode;

  modeSwitches?: TripModeSwitch[];

  timeMode?: TimeModeOption;

  requestedTime?: Date;
}

/**
 * Describes individual travel modes that are part of a parent travel rule (e.g, walk, bike, drive, bus).
 *
 * As children of generic transportation modes, they are able to be more granular in their specification and can
 * derive sub-rules (accessible vs non-accessible), or modes.
 *
 * @export
 * @interface TripPlannerRule
 */
export interface TripPlannerRule {
  modes: TripPlannerRuleMode[];

  /**
   * An array of travel option property strings. These dictate which travel mode constraitns are applied
   * to any given rule.
   *
   * This prevents constraints that are no relevant to a particular rule to be applied to it.
   *
   * For example:
   *
   *  - Driving constraints should not influence a walking rule.
   *  - Bike share constraints should not influence a driving rule.
   *
   * @type {string[]}
   * @memberof TripPlannerRule
   */
  constraints: string[];
}

export interface TripPlannerRuleMode {
  /**
   * Option that determines whether the mode will have a view.
   *
   * Defaults to `false`.
   *
   * @type {boolean}
   */
  visible?: boolean;

  /**
   * Text description that provides users contextual information on its function.
   *
   * @type {string}
   */
  description?: string;

  /**
   * A friendly display name for the travel mode option.
   *
   * @type {string}
   */
  displayName?: string;

  /**
   * Instructional verb used as a header in trip result directions list.
   *
   * @type {string}
   */
  directions_verb?: string;

  /**
   * Material design icon class name used in trip result direction list.
   *
   * @type {string}
   */
  directions_icon?: string;

  /**
   * Travel mode value. This value will be passed to the routing network.
   *
   * This property doubles as a mode ID because it should be unique across all possible modes.
   *
   * @type {number}
   */
  mode?: number;

  modes?: TripPlannerRuleMode[];

  /**
   * Certain modes require splitting into more than one trip requests such as the case for driving and bike riding
   * because an additional point is calculated and inserted into the trip and is often calculated using
   * a travel mode that is not of the same type as the rule mode.
   *
   * This process is a work-around for the routing network's inability to correctly transition between travel modes.
   *
   * @type {boolean}
   * @memberof TripPlannerRuleMode
   */
  split?: {
    /**
     * The dfault travel mode for the split trip.
     *
     * @type {number}
     */
    default?: number;
  };

  /**
   * Object that describes the travel option conditions that must be met in order for the travel mode
   * be eligible for consideration by mode calculating members.
   *
   * For example if the object has the following structure:
   *
   * ```
   *  {
   *    accessible: true,
   *    parking_pass: true
   *  }
   *```
   * It would describe a mode that is only possible when `accessible` and `parking_pass` travel options are equal to those values.
   *
   * In order for the determinant to have an effect, the respective option keys must be listed in parent rule
   * `constraints` list.
   * @type {*}
   * @memberof TripPlannerRuleMode
   */
  determinants?: any;

  /**
   * Travel option key string array that describes the effects when the travel option has a view model and the mode is "selected".
   * The model will carry a value based on the interaction for which the travel option values for the keys in the array will be equal to.
   *
   * For example, if the object has the following structure:
   *
   * ```
   * ['parking_pass']
   * ```
   *
   * If the interaction value is `true`, then the `travelOptions` value for `parking_pass` is set to `true`.
   *
   * While there may be key overlaps between `determinants` and `effects`, not all `determinants` can be or should be `effects`.
   *
   * @type {*}
   * @memberof TripPlannerRuleMode
   */
  effect?: string;
}

export interface TravelOptions {
  travel_mode?: number;

  accessible?: boolean;

  parking_pass?: boolean;

  parking_pass_permit?: string;

  nearest_door?: boolean;

  polygon_barriers?: boolean;

  a_b_networks?: boolean;

  bike_share?: boolean;

  requested_time?: Date;

  time_mode?: TimeModeOption;
}

export type TimeModeOption = 'now' | 'leave' | 'arrive';
