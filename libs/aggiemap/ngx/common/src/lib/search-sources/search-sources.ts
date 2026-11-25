import { Popups } from '@tamu-gisc/aggiemap/ngx/popups';
import { SearchSource, containsSearch, searchQueryParams } from '@tamu-gisc/ui-kits/ngx/search';

import { IComposedConnections } from '../connections';
import { IComposedIDefinitions } from '../definitions';
import { IFactoryExcludeOptions } from '../utils/definitionFactory';

// Search sources used for querying features.
import { getDefaultGisHost } from '../connections';

/**
 * The Campus Structures rows that are parking garages: `GARAGE`, and `GARAGE PVT` where it is privately operated.
 *
 * Measured against the service on 24 November 2026: it selects all eleven garage rows and excludes "TEEX ITSI Garage
 * & Offices", which is `RESEARCH` and which a search on the name alone would wrongly return (#3425).
 */
const GARAGE_STRUCTURES = "type LIKE 'GARAGE%'";

/**
 * The Campus Structures rows that are not parking garages, for the typed building search.
 *
 * The garages became rows of this layer in #3425, so the building search started answering with them too and
 * every garage appeared twice in the results - once under Building and once under Parking Garage, the same
 * row from the same layer. They are a garage's results, so the building search gives them up.
 *
 * `type IS NULL OR` is not redundant. `NULL NOT LIKE 'GARAGE%'` is NULL rather than true, so the shorter
 * clause would silently drop every row whose `type` is unset - a building that disappears from search with
 * nothing to show it had gone. Measured 24 November 2026: 1,987 rows, 11 garages, 0 with a null `type`, and
 * both forms return the same 1,976. The guard costs nothing today and covers the day that changes.
 */
const NOT_A_GARAGE = "type IS NULL OR type NOT LIKE 'GARAGE%'";

export function SearchSources(
  connections: IComposedConnections,
  definitions: IComposedIDefinitions,
  options?: IFactoryExcludeOptions<ComposedSearchSourcesKeyMap>
): Array<SearchSource> {
  const gisHost = getDefaultGisHost();

  const SEARCH_SOURCES: ComposedSearchSourcesKeyMap = {
    BUILDING: {
      source: 'building',
      name: 'Building',
      url: connections.buildingsUrl,
      queryParams: {
        ...containsSearch(['number', 'bldgabbrev', 'bldgname']),
        // Garages are rows of this layer too, and they have their own source and their own popup (#3425).
        // Only the typed search gives them up: the two exact sources below resolve deep links, and a
        // `?bldg=` link made to a garage has to keep working.
        fixedWhere: NOT_A_GARAGE,
        scoringWhere: {
          keys: ['bldgname', 'bldgabbrev'],
          operators: ['LIKE', 'LIKE'],
          wildcards: ['startsWith', 'startsWith'],
          transformations: ['UPPER', 'UPPER']
        }
      },
      scoringKeys: ['attributes.bldgabbrev', 'attributes.number', 'attributes.bldgname'],
      featuresLocation: 'features',
      displayTemplate: '{attributes.bldgname} ({attributes.number})',
      popupComponent: Popups.BuildingPopupComponent,
      searchActive: true
    },
    BUILDING_EXACT: {
      source: 'building-exact',
      name: 'Building',
      url: connections.buildingsUrl,
      queryParams: {
        ...searchQueryParams,
        // `number`, not `bldgnum`: `number` is stored without padding, `bldgnum` padded to ten characters, so an exact
        // match on `bldgnum = '0468'` finds nothing (measured 9 November 2026, #2707).
        where: {
          keys: ['number'],
          operators: ['=']
        }
      },
      featuresLocation: 'features',
      displayTemplate: '{attributes.bldgname} ({attributes.number})',
      popupComponent: Popups.BuildingPopupComponent,
      searchActive: false,
      urlQueryParam: 'bldg',
      urlQueryParamAliases: ['Bldg']
    },
    // Resolves a building from its abbreviation (e.g. `?BldgAbbrv=WCBA`) rather than its number.
    // Kept separate from BUILDING_EXACT because the registrar's links select by `BldgAbbr`, which
    // requires its own where clause; folding it into BUILDING_EXACT's aliases would (incorrectly)
    // query the abbreviation against the `number` field and return no results.
    BUILDING_EXACT_ABBR: {
      source: 'building-exact-abbr',
      name: 'Building',
      url: connections.buildingsUrl,
      queryParams: {
        ...searchQueryParams,
        where: {
          keys: ['bldgabbrev'],
          operators: ['='],
          transformations: ['UPPER']
        }
      },
      featuresLocation: 'features',
      displayTemplate: '{attributes.bldgname} ({attributes.number})',
      popupComponent: Popups.BuildingPopupComponent,
      searchActive: false,
      urlQueryParam: 'BldgAbbrv',
      urlQueryParamAliases: ['bldgabbrv', 'BldgAbbr', 'bldgabbr']
    },
    UNIVERSITY_DEPARTMENTS: {
      source: 'university-departments',
      name: 'University Departments',
      url: `${connections.departmentUrl}`,
      queryParams: {
        ...containsSearch(['DeptName', 'CollegeName', 'DeptAbbre'])
      },
      featuresLocation: 'features',
      displayTemplate: '{attributes.DeptName}',
      popupComponent: 'BasePopupComponent',
      searchActive: false,
      altLookup: {
        source: 'building-exact',
        reference: {
          keys: ['attributes.HOME1']
        }
      }
    },
    UNIVERSITY_DEPARTMENTS_EXACT: {
      source: 'university-departments-exact',
      name: 'University Departments',
      url: `${connections.departmentUrl}`,
      queryParams: {
        ...searchQueryParams,
        resultRecordCount: 100,
        where: {
          keys: ['HOME1'],
          operators: ['=']
        }
      },
      featuresLocation: 'features',
      displayTemplate: '{attributes.DeptName}',
      searchActive: false
    },
    ALL_PARKING: {
      source: 'all-parking',
      name: 'Parking',
      url: `${definitions.TRANSPORTATION_PARKING.url}`,
      queryParams: {
        ...searchQueryParams,
        returnGeometry: true,
        resultRecordCount: '*',
        outFields: `GIS.TS.ParkingLots.FAC_CODE,
          GIS.TS.ParkingLots.LotName,
          GIS.TS.SPC_PNT_CNT.UB,
          GIS.TS.SPC_PNT_CNT.Visitor_H_C
          `,
        where: {
          keys: ['1'],
          operators: ['=']
        }
      },
      featuresLocation: 'features',
      displayTemplate: '{attributes.LotName}',
      searchActive: false
    },
    VISITOR_PARKING: {
      source: 'visitor-parking',
      name: 'Visitor Parking',
      url: `${definitions.TRANSPORTATION_PARKING.url}`,
      queryParams: {
        ...searchQueryParams,
        returnGeometry: true,
        resultRecordCount: '*',
        outFields: `GIS.TS.ParkingLots.FAC_CODE,
          GIS.TS.ParkingLots.LotName,
          GIS.TS.ParkingLots.LotType
          `,
        where: {
          keys: ['GIS.TS.ParkingLots.LotType', 'GIS.TS.ParkingLots.LotType'],
          operators: ['=', '=']
        }
      },
      featuresLocation: 'features',
      displayTemplate: '{attributes.LotName}',
      searchActive: false
    },
    NIGHT_PARKING: {
      source: 'night-parking',
      name: 'Night Parking',
      // The night-privilege layer has no FAC_CODE; the trip planner matches its lots by name (#1162).
      url: connections.nightParkingUrl,
      queryParams: {
        ...searchQueryParams,
        returnGeometry: true,
        resultRecordCount: '*',
        outFields: `GIS.TS.ParkingLots.LotName,
          GIS.TS.Lot_Use.Night_Lot`,
        where: {
          keys: ['Night_Lot'],
          operators: ['=']
        }
      },
      featuresLocation: 'features',
      displayTemplate: '{attributes.LotName}',
      searchActive: false
    },
    ONE_PARKING: {
      source: 'one-parking',
      name: 'Parking',
      url: `${definitions.TRANSPORTATION_PARKING.url}`,
      queryParams: {
        ...searchQueryParams,
        returnGeometry: true,
        resultRecordCount: '*',
        outFields: `GIS.TS.ParkingLots.AggieMap,
          GIS.TS.ParkingLots.FAC_CODE,
          GIS.TS.ParkingLots.LotName,
          GIS.TS.SPC_PNT_CNT.UB`
      },
      featuresLocation: 'features',
      displayTemplate: '{attributes.LotName}',
      searchActive: false
    },
    PARKING_GARAGE: {
      source: 'parking-garage',
      name: 'Parking Garage',
      // The garages are rows of Campus Structures, marked by `type` - `GARAGE`, or `GARAGE PVT` where the garage is
      // privately operated - so `fixedWhere` keeps this search to them and off every other building (#3425). The old
      // raster basemap's Garage Parking layer, which this read until then, is abandoned (`campus-basemap.ts`).
      //
      // `bldgabbrev` is why shared links survive: it carries the same codes the old layer's `Name` did - PRG, SSG,
      // UCG, NSG, CCG, SBG, WCG, PC26 and PC27 - so a `?garage=CCG` link made before this still finds its garage.
      url: connections.buildingsUrl,
      queryParams: {
        ...containsSearch(['bldgname', 'bldgabbrev', 'number']),
        fixedWhere: GARAGE_STRUCTURES
      },
      featuresLocation: 'features',
      displayTemplate: '{attributes.bldgname}',
      // Garages used to carry lot fields, not building ones, so the building popup rendered them empty (#1163). They
      // now carry building fields, and the popup reads those; it stays its own component because a garage still needs
      // a `?garage=` link rather than the lot layer's `?lot=`.
      popupComponent: Popups.ParkingGaragePopupComponent,
      searchActive: true,
      // Garages are not in the parking lots layer, so they need their own link rather than `?lot=`.
      urlQueryParam: 'garage',
      urlQueryParamAliases: ['Garage']
    },
    // A single parking facility is stored as several polygons - the lot proper plus its loading,
    // restricted, and visitor sub-areas - all sharing a `FAC_CODE` and, often, a `LotName`. They are
    // told apart by `CIT_CODE` (the facility code plus a two-digit sub-code, where `00` is the lot
    // itself; this is the identifier TS parking map links use, e.g. `?cit=07700`).
    //
    // `?lot=` deep links resolve to `features[0]`, so an ambiguous match has to be ordered rather
    // than left in the service's default `OBJECTID` order - otherwise the sub-area that happens to
    // have been digitized first wins. `?lot=077` landed on the Lot 77 loading zone and `?lot=097`
    // on the Lot 97 visitor section for exactly this reason.
    //
    // `aggiemap DESC` drops the sub-areas flagged as not shown on this map below the ones that are,
    // and `cit_code ASC` then prefers the lot itself over its sub-areas - together resolving a bare
    // lot number to the same polygon the TS parking map's `?cit=<lot>00` link points at.
    PARKING_LOT: {
      source: 'parking-lot',
      name: 'Parking Lot',
      url: connections.surfaceLotsUrl,
      queryParams: {
        // `fac_code` is matched alongside the display names so the zero-padded facility number
        // used by TS links (`?lot=077`) resolves as readily as the unpadded `name` (`?lot=77`).
        ...containsSearch(['lotname', 'name', 'fac_code']),
        orderByFields: 'aggiemap DESC, cit_code ASC',
      },
      // Ranks an exact identifier match above the partial ones the `includes` wildcards let through,
      // so `?lot=100` cannot settle on `Lot 1001` when `Lot 100` exists.
      scoringKeys: ['attributes.name', 'attributes.fac_code', 'attributes.lotname'],
      featuresLocation: 'features',
      displayTemplate: '{attributes.lotname}',
      popupComponent: Popups.ParkingLotPopupComponent,
      searchActive: true,
      urlQueryParam: 'lot',
      urlQueryParamAliases: ['Lot']
    },
    POINTS_OF_INTEREST_EXACT: {
      source: 'points-of-interest-exact',
      name: 'Points of Interest',
      url: definitions.POINTS_OF_INTEREST.url,
      queryParams: {
        ...searchQueryParams,
        where: {
          keys: ['OBJECTID'],
          operators: ['=']
        }
      },
      featuresLocation: 'features',
      displayTemplate: '{attributes.name}',
      popupComponent: Popups.PoiPopupComponent,
      searchActive: false,
      urlQueryParam: 'poi',
      urlQueryParamAliases: ['POI']
    },
    POINTS_OF_INTEREST: {
      source: 'points-of-interest',
      name: 'Points of Interest',
      url: definitions.POINTS_OF_INTEREST.url,
      queryParams: {
        ...containsSearch(['name'])
      },
      featuresLocation: 'features',
      displayTemplate: '{attributes.name}',
      popupComponent: Popups.PoiPopupComponent,
      searchActive: true
    },
    // Nature Rx (#2630), as Points of Interest is: one source a visitor searches, and an exact one a
    // shared link opens. `key_words` is searched as well as the name because the service publishes it for
    // that - a space is as likely to be looked for as "hammocks" or "disc golf" as by its own name.
    NATURE_RX_EXACT: {
      source: 'nature-rx-exact',
      name: 'Nature Spaces',
      url: definitions.NATURE_RX.url,
      queryParams: {
        ...searchQueryParams,
        where: {
          keys: ['objectid'],
          operators: ['=']
        }
      },
      featuresLocation: 'features',
      displayTemplate: '{attributes.area_name}',
      popupComponent: Popups.NatureRxPopupComponent,
      searchActive: false,
      urlQueryParam: 'naturerx',
      urlQueryParamAliases: ['NatureRx', 'nature-rx']
    },
    NATURE_RX: {
      source: 'nature-rx',
      name: 'Nature Spaces',
      url: definitions.NATURE_RX.url,
      queryParams: {
        ...containsSearch(['area_name', 'key_words'])
      },
      featuresLocation: 'features',
      displayTemplate: '{attributes.area_name}',
      popupComponent: Popups.NatureRxPopupComponent,
      searchActive: true
    },
    BIKE_RACKS: {
      source: 'bike-racks',
      name: 'Bike Racks',
      url: `${connections.bikeRacksUrl}`,
      queryParams: {
        ...searchQueryParams,
        resultRecordCount: 9999,
        where: {
          keys: ['1'],
          operators: ['=']
        }
      },
      featuresLocation: 'features',
      displayTemplate: '{attributes.Type}',
      searchActive: false
    },
    // Deep-link-only source (searchActive: false) so a shared `?busstop=<objectid>` URL re-opens a
    // bus stop with its popup, like other point features. Keyed on objectid because stopname/stopnum
    // are not unique across routes. Backs the copy-link in BusStopPopupComponent.
    BUS_STOPS_EXACT: {
      source: 'bus-stops-exact',
      name: 'Bus Stop',
      url: `${connections.busRoutesUrl}/0`,
      queryParams: {
        ...searchQueryParams,
        where: {
          keys: ['objectid'],
          operators: ['=']
        }
      },
      featuresLocation: 'features',
      displayTemplate: '{attributes.stopname}',
      popupComponent: Popups.BusStopPopupComponent,
      searchActive: false,
      urlQueryParam: 'busstop',
      // objectid is an integer field; the value must be unquoted. The ids are each environment's own (#2636), so a
      // link opens its stop only on the environment it was copied on, and one from the old `TS/Bus_Routes` on none.
      urlQueryParamNumeric: true
    }
  };

  return Object.entries(SEARCH_SOURCES)
    .filter(([key]) => {
      if (options && options.exclude && options.exclude.length > 0) {
        const keyId = options.exclude.some((excludeKey) => {
          return key === excludeKey;
        });

        if (keyId) {
          return false;
        }
      }

      return true;
    })
    .map(([, value]) => {
      return value;
    });
}

export type ComposedSearchSourcesKeyMap = {
  BUILDING: SearchSource;
  BUILDING_EXACT: SearchSource;
  BUILDING_EXACT_ABBR: SearchSource;
  UNIVERSITY_DEPARTMENTS: SearchSource;
  UNIVERSITY_DEPARTMENTS_EXACT: SearchSource;
  ALL_PARKING: SearchSource;
  VISITOR_PARKING: SearchSource;
  NIGHT_PARKING: SearchSource;
  ONE_PARKING: SearchSource;
  PARKING_GARAGE: SearchSource;
  PARKING_LOT: SearchSource;
  POINTS_OF_INTEREST_EXACT: SearchSource;
  POINTS_OF_INTEREST: SearchSource;
  NATURE_RX_EXACT: SearchSource;
  NATURE_RX: SearchSource;
  BIKE_RACKS: SearchSource;
  BUS_STOPS_EXACT: SearchSource;
};
