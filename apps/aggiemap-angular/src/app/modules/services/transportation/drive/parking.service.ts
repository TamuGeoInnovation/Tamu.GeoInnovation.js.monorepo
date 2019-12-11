import { Injectable } from '@angular/core';
import { of, Observable, from, BehaviorSubject } from 'rxjs';
import { switchMap, take, filter, reduce } from 'rxjs/operators';

import { EsriModuleProviderService } from '@tamu-gisc/maps/esri';

import { SearchService, SearchResult, SearchSource } from '@tamu-gisc/search';

import { SettingsService, SettingsInitializationConfig } from '@tamu-gisc/common/ngx/settings';
import { SearchSources } from '../../../../../environments/environment';

import esri = __esri;

// Search source references used to retrieve all parking lots.
// const allParking = ['all-parking-garages', 'all-parking-lots'];
const allParking = ['all-parking'];

// Search source references used to retrieve a single parking location.
const oneParking = SearchSources.find((source) => source.source === 'one-parking');

@Injectable({ providedIn: 'root' })
export class ParkingService {
  private _ParkingOptions = new BehaviorSubject<ParkingOptions>({});
  public ParkingOptions = this._ParkingOptions.asObservable();

  private settingsConfig: SettingsInitializationConfig = {
    storage: {
      subKey: 'parking'
    },
    settings: {
      Use_Permit: {
        value: false,
        persistent: true
      },
      Permit: {
        value: undefined,
        persistent: true
      },
      Depart_Time: {
        value: Date.now(),
        effects: {
          get: {
            target: 'requested_time',
            fn: (v) => v
          }
        }
      },
      Visitor_Lot: {
        value: 1,
        effects: {
          get: {
            target: 'Use_Permit',
            fn: (value) => {
              return value ? 0 : 1;
            }
          }
        }
      },
      Night_Lot: {
        value: 0
      },
      UB: {
        value: 0
      },
      H_C: {
        value: 1,
        effects: {
          get: {
            target: 'accessible',
            fn: (value) => {
              return value ? 1 : 0;
            }
          }
        }
      },
      Visitor_H_C: {
        value: 1,
        effects: {
          get: {
            target: ['accessible', 'Use_Permit'],
            fn: (accessible, usePermit) => {
              return accessible === true && usePermit === false ? 1 : 0;
            }
          }
        }
      }
    }
  };

  constructor(
    private moduleProvider: EsriModuleProviderService,
    private search: SearchService,
    private settings: SettingsService
  ) {
    this.settings.init(this.settingsConfig).subscribe((res: ParkingOptions) => {
      this._ParkingOptions.next(res);
    });
  }

  /**
   * Retrieves a list of all parking lots and garages, filters duplciates, groups and orders
   * alphabetics and numerics.
   *
   * @returns {Observable<ParkingFeature[]>}
   * @memberof ParkingService
   */
  public getParkingPermits(): Observable<ParkingFeature[]> {
    return this.search
      .search({
        sources: allParking,
        values: [1],
        stateful: false
      })
      .pipe(
        take(1),
        switchMap((res) => {
          const normalized = this.normalizeAttributeKeys(res.features());

          return of(
            new SearchResult({
              results: [{ ...res.results[0], features: normalized }]
            })
          );
        }),
        switchMap(
          (results): Observable<ParkingFeature> => {
            // Return only the features in the search result.
            // Breadcrumming, source data, etc, are not needed from this point on.
            return from(results.results.map((r) => r.features as ParkingFeature[]).flat());
          }
        ),
        filter((lot) => {
          // Return the features that have a valid FAC_CODE.
          // Non-valid include null, blank, undefined;
          return Boolean(lot.attributes.FAC_CODE ? lot.attributes.FAC_CODE.trim() : false);
        }),
        reduce(
          (acc, curr) => {
            // Collect the permit features and return only the first occurrence. This effectively removes duplicate features.
            const existingIndex = acc.findIndex(
              (feature) => feature && feature.attributes && feature.attributes.FAC_CODE === curr.attributes.FAC_CODE
            );

            if (existingIndex > -1) {
              return acc;
            } else {
              return [...acc, curr];
            }
          },
          [] as ParkingFeature[]
        ),
        switchMap((filteredPermits) => {
          const grouped = filteredPermits.reduce(
            (acc, curr) => {
              const isAlphabetic = isNaN(parseInt(curr.attributes.FAC_CODE, 10));

              if (isAlphabetic) {
                acc.alphabetic = [...acc.alphabetic, curr];
                return acc;
              } else {
                acc.numeric = [...acc.numeric, curr];
                return acc;
              }
            },
            { alphabetic: [], numeric: [] } as { alphabetic: ParkingFeature[]; numeric: ParkingFeature[] }
          );

          const compareFn = (a, b) => {
            if (a.attributes.FAC_CODE > b.attributes.FAC_CODE) {
              return 1;
            } else {
              return -1;
            }
          };

          const sorted = {
            alphabetic: grouped.alphabetic.sort(compareFn),
            numeric: grouped.numeric.sort(compareFn)
          };

          return of([...sorted.numeric, ...sorted.alphabetic]);
        })
      );
  }

  /**
   * Based on the user permit selection, retrieve the location of parking location
   * authorized by a permit.
   *
   * @param {string} id Parking permit number (FAC_CODE).
   * @param {TripPoint[]} stops Trip stops. Used to identify the nearest qualifying parking feature.
   * @returns Parking feature nearest to the provided reference trip point.
   * @memberof ParkingService
   */
  public getAuthorizedParkingLocations(id: string): Observable<ParkingFeature[]> {
    // Parking options snapshot.
    const parkingOptions = this._ParkingOptions.getValue();

    // Used to evaluate time-dependent expressions.
    const date = parkingOptions.Depart_Time ? parkingOptions.Depart_Time : new Date();

    // Dictionary describing the conditions required for properties being included in an
    // authorized parking query instead of sending all of the setting properties in a single query.
    //
    // The latter condition creates invalid queries. If a user has a parking pass, and has specified one then we
    // shouldn't be routing them to any lots with visitor spots because why would they? Only attempt to find lots for which
    // their parking permits allow.
    //
    // In any query, any one parking lot must satisfy at least one of the expressions. In the above case, two required expressions would be:
    // 1) A parking lot must match a FAC_Code (User has lot 55 permit. This will ensure at least one lot will always be returned in the query.)
    // 2) Parking lots that are marked as not having visitor parking (To avoid selecing lots with visitor parking);
    //
    // The second expression matches **ALL** lots that require a parking permit, because they have to be restricted to only people with permits
    // for those lots. This however implies that any parking permit is valid in any of the parking lots, which is not true. Lot 55 permit does not grant
    // parking in lot 15.
    const includedParkingOptions = [
      {
        sqlColumn: 'GIS.TS.ParkingLots.FAC_CODE',
        include: parkingOptions.Use_Permit && parkingOptions.Permit !== undefined,
        value: parkingOptions.Permit,
        operator: '='
      },
      {
        sqlColumn: 'TS_GIS.dbo.LOTS.Visitor_Lot',
        include: !parkingOptions.Use_Permit,
        value: parkingOptions.Use_Permit && parkingOptions.Permit !== undefined ? 1 : 0,
        operator: '='
      },
      {
        sqlColumn: 'TS_GIS.dbo.LOTS.Night_Lot',
        include: parkingOptions.Use_Permit && parkingOptions.Permit !== undefined && date.getHours() >= 17,
        value: parkingOptions.Use_Permit && parkingOptions.Permit !== undefined ? 1 : 0,
        operator: '='
      },
      {
        sqlColumn: 'TS_GIS.dbo.LOTS.UB_Lot',
        include: parkingOptions.UB > 0,
        value: parkingOptions.UB > 0 ? 1 : 0,
        operator: '='
      },
      {
        sqlColumn: 'GIS.TS.SpacePnt_Count.UB',
        include: parkingOptions.UB > 0 ? 1 : 0,
        value: parkingOptions.UB > 0 ? 1 : 0,
        operator: parkingOptions.UB > 0 ? '>=' : '='
      },
      {
        sqlColumn: 'GIS.TS.SpacePnt_Count.H_C',
        // Assume if user has parking permit, they've already pre-determined whether that permit suits their needs.
        // This will remain the case until the search service is updated to allow more flexibiliy in composing SQL queries.
        include: false,
        // include: parkingOptions.H_C > 0 && parkingOptions.Use_Permit && parkingOptions.Permit !== undefined,
        value: parkingOptions.H_C > 0 ? 1 : 0,
        operator: parkingOptions.H_C > 0 ? '>=' : '='
      },
      {
        sqlColumn: 'GIS.TS.SpacePnt_Count.Visitor_H_C',
        include: parkingOptions.Visitor_H_C > 0 && !parkingOptions.Use_Permit,
        value: parkingOptions.H_C > 0 ? 1 : 0,
        operator: parkingOptions.Visitor_H_C > 0 ? '>=' : '='
      }
    ]
      .filter((option) => {
        return option.include;
      })
      .map((option) => {
        return {
          key: option.sqlColumn,
          value: option.value,
          operator: option.operator
        };
      });

    // Base source with selected keys and operators.
    const composedSource: SearchSource = JSON.parse(JSON.stringify(oneParking));
    composedSource.queryParams.where = {
      keys: includedParkingOptions.map((po) => po.key),
      operators: includedParkingOptions.map((po) => po.operator)
    };

    return this.search
      .search({
        sources: [composedSource],
        values: [includedParkingOptions.map((po) => po.value)],
        stateful: false
      })
      .pipe(
        switchMap((res) => {
          const normalized = this.normalizeAttributeKeys(res.features());

          return from(
            this.moduleProvider.require(['Graphic']).then(([Graphic]: [esri.GraphicConstructor]): ParkingFeature[] => {
              // Parking lots/decks can be multipolygon features. Our utilities only support basic polygons, so
              // this set of features must be converted into Esri Graphics that will calculate the centroid of each.
              const flattened = normalized.map((f) => {
                return new Graphic({ attributes: f.attributes, geometry: { type: 'polygon', ...f.geometry } });
              });

              if (flattened.length > 0) {
                return flattened;
              } else {
                return undefined;
              }
            })
          );
        })
      );
  }

  /**
   * Feature keys from the TS Main parking service layer contain many periods in their naming scheme.
   *
   * This makes it difficult to work with them in JS without resorting to bracket string references,
   * which are more likely to be mispelled without typing enforcement.
   *
   * This method separates the key by the periods, and uses the last index of the result.
   *
   *
   * @private
   * @param {ParkingFeature[]} features Graphic array
   * @returns {*}
   * @memberof ParkingService
   */
  private normalizeAttributeKeys(features: ParkingFeature[]) {
    return features.map((feature) => {
      if (feature.attributes) {
        const normalized = Object.keys(feature.attributes).reduce((acc, curr) => {
          if (!acc[curr]) {
            const split = curr.split('.');
            const key = split[split.length - 1];

            acc[key] = feature.attributes[curr];
            return acc;
          } else {
            return acc;
          }
        }, {});

        return {
          geometry: feature && feature.geometry ? feature.geometry : undefined,
          attributes: {
            ...normalized
          }
        };
      } else {
        return feature;
      }
    });
  }
}

/**
 * Service options that are used in class operations such as getting
 * authorized parking permits.
 *
 * @export
 * @interface ParkingOptions
 */
export interface ParkingOptions {
  Use_Permit?: boolean;
  Permit?: string;
  Depart_Time?: Date;
  Visitor_Lot?: ParkingFeature['attributes']['Visitor_Lot'];
  Night_Lot?: ParkingFeature['attributes']['Night_Lot'];
  UB?: ParkingFeature['attributes']['UB'];
  H_C?: ParkingFeature['attributes']['H_C'];
  Visitor_H_C?: ParkingFeature['attributes']['Visitor_H_C'];
}

export interface ParkingFeature extends esri.Graphic {
  attributes: {
    /**
     * Determines if the feature should be displayed on Aggiemap.
     *
     * @type {number}
     */
    AggieMap?: number;

    /**
     * Loosely matches the permit type code (what should be on a user's parking permit).
     *
     * @type {string}
     */
    FAC_CODE?: string;

    /**
     * Friendly user lot name
     *
     * @type {string}
     */
    LotName?: string;
    /**
     * Represents the number count of university business spots available.
     *
     * If the number is greater than 0, the lot supports business permit parking.
     *
     * @type {number}
     */
    UB?: number;

    /**
     * Represents the number of handicapped parking spaces. Requires lot permit.
     *
     * If then umber is greater than 0, the lot supports permitted handicapped parking.
     *
     * @type {number}
     */
    H_C?: number;

    /**
     * Represents the number of visitor handicapped parking spaces. Does not require permit.
     *
     * Might require payment.
     *
     * @type {number}
     */
    Visitor_H_C?: number;

    /**
     * Any valid permit lot. This is used during summer with daily, weekly, montly pre-paid passes.
     *
     * @type {number}
     */
    AVP_Lot?: 0 | 1;

    /**
     * If lot is available for parking during break.
     *
     * Assumption made, but not positive: is also any valid permit lot.
     *
     * @type {number}
     */
    Break_Lot?: 0 | 1;

    /**
     * Lot available for parking with any valid permit.
     *
     * @type {number}
     */
    Night_Lot?: 0 | 1;

    /**
     * Lot available for parking with a valid daily, weekly, or monthly summer pre-paid permit.
     *
     * @type {number}
     */
    PrepaidSumm_Lot?: 0 | 1;

    /**
     * Lost available for parking with any valid permit.
     *
     * @type {number}
     */
    Summer_Lot?: 0 | 1;

    /**
     * Entire lot available with any valid business parking permit.
     *
     * @type {number}
     */
    UB_Lot?: 0 | 1;

    /**
     * Entire lot available for visitor parking.
     *
     * Might require payment.
     *
     * @type {number}
     */
    Visitor_Lot?: 0 | 1;

    /**
     * User specified parking permit code.
     *
     * @type {(number | string)}
     */
    Permit_Pass?: number | string;
  };
}
