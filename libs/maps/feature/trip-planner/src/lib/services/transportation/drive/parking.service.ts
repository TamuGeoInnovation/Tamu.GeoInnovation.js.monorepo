import { Injectable } from '@angular/core';
import { of, Observable, from, BehaviorSubject, forkJoin } from 'rxjs';
import { switchMap, take, filter, reduce, map, mergeMap, toArray } from 'rxjs/operators';

import { EsriModuleProviderService } from '@tamu-gisc/maps/esri';
import { SearchService, SearchResult, SearchSource } from '@tamu-gisc/ui-kits/ngx/search';
import { SettingsService, SettingsInitializationConfig } from '@tamu-gisc/common/ngx/settings';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import esri = __esri;

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
    private settings: SettingsService,
    private environment: EnvironmentService
  ) {
    this.settings.init(this.settingsConfig).subscribe((res: ParkingOptions) => {
      this._ParkingOptions.next(res);
    });
  }

  /**
   * Retrieves a list of all parking lots and garages, filters duplicates, groups and orders
   * alphabetics and numerics.
   */
  public getParkingPermits(): Observable<ParkingFeature[]> {
    const source = this.environment.value('SearchSources').find((source) => source.source === 'all-parking');

    return this.search
      .search<ParkingFeature>({
        sources: [source],
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
        switchMap((results): Observable<ParkingFeature> => {
          // Return only the features in the search result.
          // Breadcrumbing, source data, etc, are not needed from this point on.
          return from(results.results.map((r) => r.features as ParkingFeature[]).flat());
        }),
        filter((lot) => {
          // Return the features that have a valid FAC_CODE.
          // Non-valid include null, blank, undefined;
          return Boolean(lot.attributes.FAC_CODE ? lot.attributes.FAC_CODE.trim() : false);
        }),
        reduce((acc, curr) => {
          // Collect the permit features and return only the first occurrence. This effectively removes duplicate features.
          const existingIndex = acc.findIndex(
            (feature) => feature && feature.attributes && feature.attributes.FAC_CODE === curr.attributes.FAC_CODE
          );

          if (existingIndex > -1) {
            return acc;
          } else {
            return [...acc, curr];
          }
        }, [] as ParkingFeature[]),
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
   * Based on the user permit selection, retrieve parking locations
   * authorized by a permit.
   */
  public getAuthorizedParkingLocations(): Observable<ParkingFeature[]> {
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
    // 2) Parking lots that are marked as not having visitor parking (To avoid selecting lots with visitor parking);
    //
    // The second expression matches **ALL** lots that require a parking permit, because they have to be restricted to only people with permits
    // for those lots. This however implies that any parking permit is valid in any of the parking lots, which is not true. Lot 55 permit does not grant
    // parking in lot 15.
    const includedParkingOptions = [
      {
        searchSource: 'all-parking',
        sqlColumns: ['GIS.TS.ParkingLots.FAC_CODE'],
        include: parkingOptions.Use_Permit === true,
        values: [parkingOptions.Permit],
        operators: ['=']
      },
      {
        searchSource: 'visitor-parking',
        sqlColumns: ['TS_GIS.dbo.LOTS.Visitor_Lot'],
        include: parkingOptions.Use_Permit === false,
        values: parkingOptions.Use_Permit && parkingOptions.Permit !== undefined ? [1] : [0],
        operators: ['=']
      },
      {
        searchSource: 'night-parking',
        sqlColumns: ['Night_Lot'],
        include:
          parkingOptions.Permit !== undefined &&
          parkingOptions.Use_Permit &&
          ((date.getHours() >= 17 && date.getHours() <= 23) || (date.getHours() >= 0 && date.getHours() <= 4)),
        values: parkingOptions.Use_Permit && parkingOptions.Permit !== undefined ? [1] : [0],
        operators: ['=']
      },
      {
        sqlColumns: ['TS_GIS.dbo.LOTS.UB_Lot'],
        // This is not supported at the moment but will be in the future. Never include it in the search queries.
        include: false,
        values: parkingOptions.UB > 0 ? [1] : [0],
        operators: ['=']
      },
      {
        sqlColumns: ['GIS.TS.SpacePnt_Count.UB'],
        include: false,
        // This is not supported at the moment but will be in the future. Never include it in the search queries.
        values: parkingOptions.UB > 0 ? [1] : [0],
        operators: parkingOptions.UB > 0 ? ['>='] : ['=']
      },
      {
        sqlColumns: ['GIS.TS.SpacePnt_Count.H_C'],
        // Assume if user has parking permit, they've already pre-determined whether that permit suits their needs.
        // This will remain the case until the search service is updated to allow more flexibility in composing SQL queries.
        include: false,
        // include: parkingOptions.H_C > 0 && parkingOptions.Use_Permit && parkingOptions.Permit !== undefined,
        values: parkingOptions.H_C > 0 ? [1] : [0],
        operators: parkingOptions.H_C > 0 ? ['>='] : ['=']
      },
      {
        searchSource: 'all-parking',
        sqlColumns: ['GIS.TS.SpacePnt_Count.Visitor_H_C'],
        include: parkingOptions.Visitor_H_C > 0 && parkingOptions.Use_Permit === false,
        values: parkingOptions.H_C > 0 ? [1] : [0],
        operators: parkingOptions.Visitor_H_C > 0 ? ['>='] : ['=']
      }
    ].filter((option) => {
      return option.include;
    });

    const queries = includedParkingOptions.map((incl) => {
      let source = (this.environment.value('SearchSources') as Array<SearchSource>).find(
        (s) => s.source === incl.searchSource
      );

      if (source !== undefined) {
        source = JSON.parse(JSON.stringify(source));
      } else {
        throw new Error('No search source found for parking restriction.');
      }

      source.queryParams.where = {
        keys: incl.sqlColumns,
        operators: incl.operators
      };

      return this.search.search<ParkingFeature>({
        sources: [source],
        values: [incl.values],
        stateful: false
      });
    });

    return forkJoin(queries).pipe(
      mergeMap((results) => results),
      switchMap((res) => from(this.normalizeAttributeKeys(res.features()))),
      reduce((acc, curr) => {
        if (acc[curr.attributes.LotName] !== undefined) {
          acc[curr.attributes.LotName].count++;
          acc[curr.attributes.LotName].attributes = { ...acc[curr.attributes.LotName].attributes, ...curr.attributes };
        } else {
          acc[curr.attributes.LotName] = { count: 1 };
          acc[curr.attributes.LotName].attributes = curr.attributes;
          acc[curr.attributes.LotName].geometry = curr.geometry;
        }

        return acc;
      }, {}),
      switchMap((filtered) => {
        return from(Object.entries(filtered)).pipe(
          filter(([, value]: [string, { count: number; attributes: unknown; geometry: unknown }]) => {
            return value.count === queries.length;
          }),
          map(([, value]) => {
            return {
              attributes: value.attributes,
              geometry: value.geometry
            } as ParkingFeature;
          }),
          switchMap((f) => {
            return from(this.moduleProvider.require(['Graphic'])).pipe(
              map(([Graphic]) => {
                return new Graphic({ attributes: f.attributes, geometry: { type: 'polygon', ...f.geometry } });
              })
            );
          }),
          toArray()
        );
      })
    );
  }

  /**
   * Feature keys from the TS Main parking service layer contain many periods in their naming scheme.
   *
   * This makes it difficult to work with them in JS without resorting to bracket string references,
   * which are more likely to be misspelled without typing enforcement.
   *
   * This method separates the key by the periods, and uses the last index of the result.
   *
   * @param {ParkingFeature[]} features Graphic array
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
        } as ParkingFeature;
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
     */
    AggieMap?: number;

    /**
     * Loosely matches the permit type code (what should be on a user's parking permit).
     */
    FAC_CODE?: string;

    /**
     * Friendly user lot name
     */
    LotName?: string;
    /**
     * Represents the number count of university business spots available.
     *
     * If the number is greater than 0, the lot supports business permit parking.
     */
    UB?: number;

    /**
     * Represents the number of handicapped parking spaces. Requires lot permit.
     *
     * If then umber is greater than 0, the lot supports permitted handicapped parking.
     */
    H_C?: number;

    /**
     * Represents the number of visitor handicapped parking spaces. Does not require permit.
     *
     * Might require payment.
     */
    Visitor_H_C?: number;

    /**
     * Any valid permit lot. This is used during summer with daily, weekly, monthly pre-paid passes.
     */
    AVP_Lot?: 0 | 1;

    /**
     * If lot is available for parking during break.
     *
     * Assumption made, but not positive: is also any valid permit lot.
     */
    Break_Lot?: 0 | 1;

    /**
     * Lot available for parking with any valid permit.
     */
    Night_Lot?: 0 | 1;

    /**
     * Lot available for parking with a valid daily, weekly, or monthly summer pre-paid permit.
     */
    PrepaidSumm_Lot?: 0 | 1;

    /**
     * Lost available for parking with any valid permit.
     */
    Summer_Lot?: 0 | 1;

    /**
     * Entire lot available with any valid business parking permit.
     */
    UB_Lot?: 0 | 1;

    /**
     * Entire lot available for visitor parking.
     *
     * Might require payment.
     */
    Visitor_Lot?: 0 | 1;

    /**
     * User specified parking permit code.
     */
    Permit_Pass?: number | string;
  };
}
