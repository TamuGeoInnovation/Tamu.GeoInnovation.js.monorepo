import { TAMU_CAMPUS_BASEMAP_URL } from '@tamu-gisc/common/datasets/geographic';

import { actingAsProduction } from './acting-as-production';

/** Transportation's own host, where production reads its services (#2653). */
const PRODUCTION_TS_HOST = 'arc.ts.tamu.edu';

/** The production GIS server, which a development build reads the services below from. */
const PRODUCTION_GIS_HOST = 'gis.it.tamu.edu';

const NO_HOSTED_VIEW_ON_DEVELOPMENT =
  "the development server has only the older MapServer the hosted view replaced, which lacks objectid (the search sources and share links are built on it) and the view's other fields";
const RETIRED = 'a retired 150th-anniversary event, with no counterpart on the development server';
const TOKEN_REQUIRED = 'the development server has this service but answers 499 "Token Required", so a development build cannot read it';

/**
 * The services a development build reads from production, because the development server cannot serve them to a
 * browser, each with why. It is the one list behind both the pin and the Layers list's marker (#2744): `Connections`
 * reads each from production on a development host, and `markReadFromProduction` marks every layer drawn from one, so
 * a layer cannot be pinned without being marked or marked without being pinned.
 *
 * Transportation's are the list to take to Transportation (#2653): publish the hosted view on the development server,
 * unsecured, and the map becomes testable there. Measured 5 November 2026 against both hosts, by layer id, layer name
 * and field list. Being on the development server is not enough: 4-H Roundup's view was, and answered 499 (#2695).
 * `services.spec.ts` in the smoke suite fails on a service a development build cannot read while production serves it.
 */
export const READ_FROM_PRODUCTION_ON_DEVELOPMENT: Partial<Record<keyof IComposedConnections, string>> = {
  // Layer 6 alone, not all of TS_Main: the development server's other seven layers match production's field for field,
  // and layer 6's space counts are there too, but joined as GIS.TS.SpacePnt_Count.* where the code reads
  // GIS.TS.SPC_PNT_CNT.*. Measured 8 November 2026 (#2756).
  tsParkingLotsUrl:
    'layer 6 on the development server has the space counts as GIS.TS.SpacePnt_Count.*, not the GIS.TS.SPC_PNT_CNT.* the parking search and drive directions read',
  accessibleParkingUrl: NO_HOSTED_VIEW_ON_DEVELOPMENT,
  beefCattleUrl: NO_HOSTED_VIEW_ON_DEVELOPMENT,
  // The development server has the hosted view's predecessor, TS/TSConstruction, with the same layers and fields
  // (PascalCase, which the popups already read either way), but its queries return no geometry - the same fault that
  // retired production's copy - so a map reading it would draw nothing. Measured 8 November 2026 (#2756).
  constructionUrl:
    'the development server has no hosted view, and its TS/TSConstruction MapServer answers queries without geometry, so nothing would draw',
  familyWeekendUrl: NO_HOSTED_VIEW_ON_DEVELOPMENT,
  fireSchoolUrl: NO_HOSTED_VIEW_ON_DEVELOPMENT,
  gamesOfTexasUrl: NO_HOSTED_VIEW_ON_DEVELOPMENT,
  maroonWhiteGameUrl: NO_HOSTED_VIEW_ON_DEVELOPMENT,
  moveInParkingUrl: NO_HOSTED_VIEW_ON_DEVELOPMENT,
  ms150Url: NO_HOSTED_VIEW_ON_DEVELOPMENT,
  ringDayUrl: NO_HOSTED_VIEW_ON_DEVELOPMENT,
  summerCommencementUrl: NO_HOSTED_VIEW_ON_DEVELOPMENT,
  tCampUrl: NO_HOSTED_VIEW_ON_DEVELOPMENT,
  fourHRoundupUrl: `${TOKEN_REQUIRED} (#2695)`,
  micromobilityUrl: `${TOKEN_REQUIRED} (#2712)`,
  inforUrl: 'the development server has FCOR/MapInfo_20190529 with no layers, so every layer of it answers 404 (#2744)',
  accessibleUrl: 'the development server has FCOR/ADA_120717 with no layers, so layer 0 answers 404 "Layer not found" (#2744)',
  bikeMapUrl: `${TOKEN_REQUIRED} (#2744)`,
  bikeRacksUrl: `${TOKEN_REQUIRED} (#2744)`,
  // Named on gis.tamu.edu outright below, so these read production everywhere already; listed so the Layers list marks them.
  lactationRoomsUrl: 'the development server does not have this service (#1963)',
  natureRxUrl: `${TOKEN_REQUIRED} (#2630)`,
  // Not `basemapUrl`, deliberately, though it reads production on every environment too. Its layers - Buildings and
  // Surface Lots on the main map - arrive with the campus basemap, which reads production everywhere by design, so a
  // marker on the busiest layers on the map would be noise rather than information. Decided by the maintainer,
  // 8 November 2026; `connections.spec.ts` fails if it is added.
  kickoff150thUrl: RETIRED,
  kickoffAtKyleUrl: RETIRED,
  liveAtTheStationUrl: RETIRED,
  spiritOf150WeekUrl: RETIRED
};

function createConnections(gisHost: string): IComposedConnections {
  const own = servicesOn(gisHost);

  if (!gisHost.includes('dev')) {
    return own;
  }

  const production = servicesOn(PRODUCTION_GIS_HOST);
  const keys = Object.keys(READ_FROM_PRODUCTION_ON_DEVELOPMENT) as Array<keyof IComposedConnections>;

  return { ...own, ...Object.fromEntries(keys.map((key) => [key, production[key]])) };
}

function servicesOn(gisHost: string): IComposedConnections {
  // Transportation's services (#2653). Production serves them from Transportation's own host, most of them in its
  // `TS_Events` folder. Development serves them from the development GIS server, which has no `TS_Events` folder but a
  // `TS` folder whose services have the same names, layers and fields - measured on 5 November 2026 for every service
  // below, by layer id, layer name and field list. Read from `gisHost` rather than from the browser's address, so that
  // `Connections(host)` - which the smoke suite calls with an explicit host - resolves the same services the
  // application would on that environment.
  const development = gisHost.includes('dev');
  const tsgisHost = development ? 'gis.dev.tamu.edu' : PRODUCTION_TS_HOST;
  const tsEvents = `https://${tsgisHost}/arcgis/rest/services/${development ? 'TS' : 'TS_Events'}`;
  return {
    // The campus basemap, as data: layer 1 is the Buildings layer and the building search source,
    // layer 9 is Surface Lots. The October 2026 service it now names is published on the production
    // server, where it is public, and is not on the development one - its FCOR folder lists six
    // services and this is not among them (#1696). So it is named on gis.tamu.edu outright rather
    // than through `gisHost`, and the way the tile layer in
    // `basemaps.definition.ts` has always named it. Development therefore reads its buildings and
    // surface lots from the same service it already draws its basemap tiles from. Restore
    // `${gisHost}` once #1696 publishes it on the development server.
    basemapUrl: TAMU_CAMPUS_BASEMAP_URL,
    inforUrl: `https://${gisHost}/arcgis/rest/services/FCOR/MapInfo_20190529/MapServer`,
    accessibleUrl: `https://${gisHost}/arcgis/rest/services/FCOR/ADA_120717/MapServer/0`,
    // Lactation rooms, a hosted service from Facilities Analytics & Mapping that replaced layer 2 of
    // `inforUrl` (#1960). It is published on the production GIS server only, where it is public; the
    // development server answers "Service not found". So it is named on gis.tamu.edu outright, as
    // `basemapUrl` is, and development reads production's rooms. Restore `${gisHost}` once #1963
    // publishes it on the development server.
    lactationRoomsUrl: 'https://gis.tamu.edu/arcgis/rest/services/Hosted/Lactation_Spaces_view/FeatureServer/0',
    // Nature Rx spaces, a hosted service from Facilities Analytics & Mapping (#2630). The development
    // GIS server has it but answers "Token Required", so a `${gisHost}` URL would draw nothing on
    // development; it is named on gis.tamu.edu outright, as `lactationRoomsUrl` is, and development reads
    // production's spaces. Restore `${gisHost}` if it is ever published unsecured on development.
    natureRxUrl: 'https://gis.tamu.edu/arcgis/rest/services/Hosted/NatureRx_view/FeatureServer/0',
    // A development build reads the services in `READ_FROM_PRODUCTION_ON_DEVELOPMENT` from production, whatever they
    // are written as here; the list says why for each (#2653, #2744).
    constructionUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/TSConstruction_Hosted/FeatureServer/0`,
    departmentUrl: `https://${gisHost}/arcgis/rest/services/FCOR/DepartmentSearch/MapServer/1`,
    tsMainUrl: `${tsEvents}/TS_Main/MapServer`,
    // Parking Lots, the one layer of TS_Main that carries the space counts. Its own connection so that it can be read
    // from production without the rest of TS_Main (#2756).
    tsParkingLotsUrl: `${tsEvents}/TS_Main/MapServer/6`,
    // Night-privilege lots, used by drive directions. Moved from the `TS` folder to `TS_Events` (#1162).
    nightParkingUrl: `${tsEvents}/AVPVisBSUBVenNWRetNSCMed/MapServer/6`,
    // TS/TS_Bicycles no longer exists on the production GIS server, and on dev its layer 3 is bike lanes.
    // Bike racks are layer 1 of TS/BikeMap, which the main map's Bike Racks layer already uses (#1122).
    bikeRacksUrl: `https://${gisHost}/arcgis/rest/services/TS/BikeMap/MapServer/1`,
    bikeMapUrl: `https://${gisHost}/arcgis/rest/services/TS/BikeMap/MapServer`,
    routingBaseUrl: `https://${gisHost}/arcgis/rest/services/Routing`,
    // The routing network Transportation published for #659. It is on the development GIS server only, outside the
    // `Routing` folder and not under a dated name, so the trip planner's discovery of `routingBaseUrl` would not find
    // it. Pinned so localhost reaches it too; the trip planner reads it only where
    // development-only features are on, and the smoke suite fails if production ever requests it.
    developmentRoutingBaseUrl: 'https://gis-dev.it.tamu.edu/arcgis/rest/services/RoutingProPublish',
    poiUrl: 'https://services1.arcgis.com/oxXAea6csqnDZ6WT/arcgis/rest/services/Points_of_Interest_view/FeatureServer',
    diningLocationsUrl: `https://api.aggiemap.tamu.edu/dining/locations/geojson`,
    aggiePrintUrl: 'https://services1.arcgis.com/qr14biwnHA6Vis6l/ArcGIS/rest/services/TAMUPrinters/FeatureServer',
    maroonWhiteGameUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/Maroon_White_Game_view/FeatureServer`,
    accessibleParkingUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/AccessibleParking_view/FeatureServer`,
    kickoff150thUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/150th_Kickoff/FeatureServer`,
    aggieFamilyParadeUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/Aggie_Family_Parade_view/FeatureServer`,
    aggielandSaturdayUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/AggielandSaturday_view/FeatureServer`,
    avpParkingUrl: `${tsEvents}/AnyValidPermitParking/MapServer`,
    baseballParkingUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/BaseballParking_view/FeatureServer`,
    bigEventUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/Big_Event_view/FeatureServer`,
    breakSummerParkingUrl: `${tsEvents}/SummerBreakParking/MapServer`,
    businessParkingUrl: `${tsEvents}/BusinessParking/MapServer`,
    contractorParkingUrl: `${tsEvents}/ContractorParking/MapServer`,
    crossCountryParkingUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/CrossCountryParking_view/FeatureServer`,
    familyWeekendUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/Family_Weekend_view/FeatureServer`,
    freshmanParkingUrl: `${tsEvents}/FreshmanSelectableParking/MapServer`,
    graduationParkingUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/GraduationParking_view/FeatureServer`,
    hsGraduationUrl: `${tsEvents}/HS_Graduation/MapServer`,
    indoorTrackParkingUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/IndoorTrackParking_view/FeatureServer`,
    loadingZonesUrl: `${tsEvents}/Loading_Zones/MapServer`,
    kickoffAtKyleUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/Kickoff_at_Kyle/FeatureServer`,
    liveAtTheStationUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/Live_at_the_Station/FeatureServer`,
    maintenanceParkingUrl: `${tsEvents}/MaintenanceParking/MapServer`,
    mediaParkingUrl: `${tsEvents}/MediaParking/MapServer`,
    // Moved to the production GIS server for the editor map (#1749); not on the transportation host, so named outright.
    // The one athletics service whose **path** differs between environments as well as its host: production is
    // `MBskt_view` on the production GIS server, where #1749 moved it so Transportation maintain it in their editor
    // map; development is `MensBasketballParking_view` (#2143).
    //
    // #1749 pinned this to a single address because the copy left behind stopped being updated, and a map reading it
    // showed last season's lots and closures with nothing to say they were stale. That is no longer the risk: the GIS
    // team are publishing and maintaining a development copy of every service, so the development view is kept
    // current rather than abandoned. `connections.spec.ts` now checks each environment reads its own.
    mensBasketballUrl: development
      ? `https://${tsgisHost}/arcgis/rest/services/Hosted/MensBasketballParking_view/FeatureServer`
      : 'https://gis.tamu.edu/arcgis/rest/services/Hosted/MBskt_view/FeatureServer',
    motorcycleParkingUrl: `${tsEvents}/MotorcycleParking/MapServer`,
    motoristAssistanceUrl: `${tsEvents}/MotoristAssistance/MapServer`,
    moveInParkingUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/FallMoveInParking_view/FeatureServer`,
    moveOutParkingUrl: `${tsEvents}/MoveOutParking/MapServer`,
    ms150Url: `https://${tsgisHost}/arcgis/rest/services/Hosted/MS150_view/FeatureServer`,
    // Development publishes Muster under another name, with the same layers and fields (#2653).
    musterUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/${development ? 'MusterParking_view' : 'Muster_view'}/FeatureServer`,
    nightWeekendParkingUrl: `${tsEvents}/NightWeekendParking/MapServer`,
    nscParkingUrl: `${tsEvents}/NewStudentConferenceParking/MapServer`,
    outdoorTrackParkingUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/OutdoorTrackParking_view/FeatureServer`,
    physicsFestUrl: `${tsEvents}/Physics_Fest/MapServer`,
    retireeParkingUrl: `${tsEvents}/RetireeParking/MapServer`,
    ringDayUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/Ring_Day_view/FeatureServer`,
    savannahBananasUrl: `https://${gisHost}/arcgis/rest/services/TS/SavannahBananas/MapServer`,
    secGroundsConferenceUrl: `${tsEvents}/SEC_Grounds_Conference/MapServer`,
    soccerParkingUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/SoccerParking_view/FeatureServer`,
    softballParkingUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/SoftballParking_view/FeatureServer`,
    softballRegionalsUrl: `https://${gisHost}/arcgis/rest/services/TS/Softball_Regionals/MapServer`,
    spiritOf150WeekUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/Spirit_of_150_Week/FeatureServer`,
    staffParkingUrl: `${tsEvents}/StaffSelectableParking/MapServer`,
    studentParkingUrl: `${tsEvents}/StudentSelectableParking/MapServer`,
    summerCommencementUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/Summer_Commencement_view/FeatureServer`,
    swimmingParkingUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/SwimmingParking_view/FeatureServer`,
    tennisParkingUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/TennisParking_view/FeatureServer`,
    timedParkingUrl: `${tsEvents}/TimedParking/MapServer`,
    troubadourFestivalUrl: `https://${gisHost}/arcgis/rest/services/TS/Troubadour_Festival/MapServer`,
    vendorParkingUrl: `${tsEvents}/VendorParking/MapServer`,
    visitorParkingUrl: `${tsEvents}/VisitorParking/MapServer`,
    volleyballParkingUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/VolleyballParking_view/FeatureServer`,
    womensBasketballUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/WomensBasketballParking_view/FeatureServer`,
    fourHRoundupUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/4H_Roundup_view/FeatureServer`,
    // Published on the development GIS server only (#2713), so named there outright, as `busRoutesUrl` is, and read
    // from that server on every environment, localhost included. The map is development-only until Texas A&M is
    // announced as a host; moving it means naming the production service here.
    ncaaVolleyballUrl: 'https://gis.dev.tamu.edu/arcgis/rest/services/Hosted/NCAA_Volleyball_view/FeatureServer',
    // The map is development-only until the maintainer moves it, so production never reads it (#2712).
    micromobilityUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/Micromobility_Map_WFL1_view/FeatureServer`,
    gisDayUrl:
      'https://services1.arcgis.com/qr14biwnHA6Vis6l/ArcGIS/rest/services/MSC_and_Rudder_Building_Polygon_Layer/FeatureServer',
    argentinaVsHondurasUrl: `https://${gisHost}/arcgis/rest/services/TS/Argentina_vs_Honduras26/MapServer`,
    // AggieSpirit bus stops (layer 0) and routes (layer 1), Transportation's hosted view, public on both its hosts and
    // read like its other services (#2636). It replaced `TS/Bus_Routes`, which was public on the development server
    // only. The view's field names are lower case, and its stop ids are new and differ between the hosts. The
    // application provides this to `BusService` as `BUS_ROUTES_URL`, because that service lives in a library that
    // cannot import this one.
    busRoutesUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/Bus_Routes_view/FeatureServer`,
    fishCampUrl: `${tsEvents}/Fish_Camp/MapServer`,
    tCampUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/T_Camp_view/FeatureServer`,
    fireSchoolUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/Municipal_Fire__School_Vendor_Show_view/FeatureServer`,
    beefCattleUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/Beef_Cattle_Vendor_Load_In_view/FeatureServer`,
    gamesOfTexasUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/Games_of_Texas_view/FeatureServer`,
    // Satellite-campus basemaps. These are fixed `gis.tamu.edu` hosted services (not tied to
    // gisHost/tsgisHost), each with a companion FeatureServer of the same name used for search.
    galvestonBasemapUrl: 'https://gis.tamu.edu/arcgis/rest/services/Hosted/GalBase2/VectorTileServer',
    galvestonFeatureServerUrl: 'https://gis.tamu.edu/arcgis/rest/services/Hosted/GalBase2/FeatureServer',
    mcallenBasemapUrl: 'https://gis.tamu.edu/arcgis/rest/services/Hosted/HigherEd/VectorTileServer',
    mcallenFeatureServerUrl: 'https://gis.tamu.edu/arcgis/rest/services/Hosted/HigherEd/FeatureServer',
    dcBushSchoolBasemapUrl: 'https://gis.tamu.edu/arcgis/rest/services/Hosted/DCBush/VectorTileServer',
    dcBushSchoolFeatureServerUrl: 'https://gis.tamu.edu/arcgis/rest/services/Hosted/DCBush/FeatureServer',
    fortWorthLawBasemapUrl: 'https://gis.tamu.edu/arcgis/rest/services/Hosted/FWLaw/VectorTileServer',
    fortWorthLawFeatureServerUrl: 'https://gis.tamu.edu/arcgis/rest/services/Hosted/FWLaw/FeatureServer',
    // The Houston Space Institute's portal item lives on `divops.tamu.edu`, but its services are on
    // `gis.tamu.edu` like every other campus, so there is no second portal host here (#2438).
    houstonSpaceInstituteBasemapUrl: 'https://gis.tamu.edu/arcgis/rest/services/Hosted/HSI/VectorTileServer',
    houstonSpaceInstituteFeatureServerUrl: 'https://gis.tamu.edu/arcgis/rest/services/Hosted/HSI/FeatureServer',
    maysCityCenterBasemapUrl: 'https://gis.tamu.edu/arcgis/rest/services/Hosted/Mays/VectorTileServer',
    maysCityCenterFeatureServerUrl: 'https://gis.tamu.edu/arcgis/rest/services/Hosted/Mays/FeatureServer',
    hscRoundRockBasemapUrl: 'https://gis.tamu.edu/arcgis/rest/services/Hosted/HSCRR/VectorTileServer',
    hscRoundRockFeatureServerUrl: 'https://gis.tamu.edu/arcgis/rest/services/Hosted/HSCRR/FeatureServer',
    hscKingsvilleBasemapUrl: 'https://gis.tamu.edu/arcgis/rest/services/Hosted/HSCK/VectorTileServer',
    hscKingsvilleFeatureServerUrl: 'https://gis.tamu.edu/arcgis/rest/services/Hosted/HSCK/FeatureServer',
    hscCorpusChristiBasemapUrl: 'https://gis.tamu.edu/arcgis/rest/services/Hosted/HSCC/VectorTileServer',
    hscCorpusChristiFeatureServerUrl: 'https://gis.tamu.edu/arcgis/rest/services/Hosted/HSCC/FeatureServer',
    hscDallasBasemapUrl: 'https://gis.tamu.edu/arcgis/rest/services/Hosted/HSCD/VectorTileServer',
    hscDallasFeatureServerUrl: 'https://gis.tamu.edu/arcgis/rest/services/Hosted/HSCD/FeatureServer'
  };
}

/**
 * Backwards-compatible single-host getter.
 * Existing code can continue to call `getDefaultGisHost()` and receive the string host.
 * New code that needs both hosts should call `getDefaultGisHosts()`.
 */
export function getDefaultGisHost(): string {
  return getDefaultGisHosts().gisHost;
}

/**
 * Whether this page reads the development GIS server: its hostname contains `dev`, and it was not asked
 * to behave as production (#1722). Localhost reads production's.
 */
export function readsDevelopmentGisServer(
  address: { hostname: string; search: string } | undefined = globalThis.location
): boolean {
  return address?.hostname.includes('dev') === true && !actingAsProduction(address);
}

/**
 * New: return both gisHost and tsgisHost for callers that need both base URLs.
 * Default values follow hostname-based dev detection:
 * - gisHost: 'gis-dev.it.tamu.edu' / 'gis.it.tamu.edu'
 * - tsgisHost: 'gis.dev.tamu.edu' / 'arc.ts.tamu.edu'
 */
export function getDefaultGisHosts() {
  const gisHost = readsDevelopmentGisServer() ? 'gis-dev.it.tamu.edu' : PRODUCTION_GIS_HOST;
  // Transportation's services on the development server are under `TS`, not production's `TS_Events`; `Connections`
  // applies that and names the services development cannot serve yet (#2653).
  const tsgisHost = readsDevelopmentGisServer() ? 'gis.dev.tamu.edu' : PRODUCTION_TS_HOST;

  return { gisHost, tsgisHost } as { gisHost: string; tsgisHost: string };
}

/**
 * The sources a development build reads from production, each given the reason as `readFromProduction`, which the
 * Layers list shows as a marker (#2744). Read from `READ_FROM_PRODUCTION_ON_DEVELOPMENT`, the list `Connections` pins
 * by, so the marker and the pin cannot disagree. A source counts when its URL is a listed service or one of its layers.
 * A group counts when any of its children does, because a list may show the group alone: Sustainable Transportation
 * hides its six bike layers. Where `gisHost` is production's, nothing is read from production for want of
 * a development service, and the sources come back as they are - so the marker never appears on production.
 */
export function markReadFromProduction<T extends MarkableSource>(sources: T[], gisHost = getDefaultGisHost()): T[] {
  if (!gisHost.includes('dev')) {
    return sources;
  }

  const production = servicesOn(PRODUCTION_GIS_HOST);
  const pinned = (Object.entries(READ_FROM_PRODUCTION_ON_DEVELOPMENT) as Array<[keyof IComposedConnections, string]>).map(
    ([key, reason]) => ({ url: production[key], reason })
  );
  const reasonFor = (url: unknown) =>
    typeof url === 'string' ? pinned.find((pin) => url === pin.url || url.startsWith(`${pin.url}/`))?.reason : undefined;

  return sources.map((source) => {
    const marked = source.sources ? markReadFromProduction(source.sources, gisHost) : undefined;
    const reasons = [reasonFor(source.url), ...(marked ?? []).map((child) => child.readFromProduction)];
    const reason = [...new Set(reasons.filter((r): r is string => r !== undefined))].join('; ');

    return {
      ...source,
      ...(marked ? { sources: marked } : {}),
      ...(reason ? { readFromProduction: reason } : {})
    };
  });
}

/**
 * The parts of a layer source `markReadFromProduction` reads and writes. Named here rather than imported as
 * `LayerSource`, so that the smoke suite, which imports this file, does not need the types library (#2744).
 */
interface MarkableSource {
  url?: unknown;
  sources?: MarkableSource[];
  readFromProduction?: string;
}

export type IConnectionsFactory = ((gisHost: string) => IComposedConnections) & IComposedConnections;

export const Connections: IConnectionsFactory = Object.assign(
  ((gisHost: string) => createConnections(gisHost)) as IConnectionsFactory,
  createConnections(getDefaultGisHost())
);

export interface IComposedConnections {
  basemapUrl: string;
  inforUrl: string;
  accessibleUrl: string;
  lactationRoomsUrl: string;
  natureRxUrl: string;
  constructionUrl: string;
  departmentUrl: string;
  tsMainUrl: string;
  tsParkingLotsUrl: string;
  nightParkingUrl: string;
  bikeRacksUrl: string;
  bikeMapUrl: string;
  routingBaseUrl: string;
  developmentRoutingBaseUrl: string;
  poiUrl: string;
  diningLocationsUrl: string;
  aggiePrintUrl: string;
  maroonWhiteGameUrl: string;
  accessibleParkingUrl: string;
  kickoff150thUrl: string;
  aggieFamilyParadeUrl: string;
  aggielandSaturdayUrl: string;
  avpParkingUrl: string;
  baseballParkingUrl: string;
  bigEventUrl: string;
  breakSummerParkingUrl: string;
  businessParkingUrl: string;
  contractorParkingUrl: string;
  crossCountryParkingUrl: string;
  familyWeekendUrl: string;
  freshmanParkingUrl: string;
  graduationParkingUrl: string;
  hsGraduationUrl: string;
  indoorTrackParkingUrl: string;
  loadingZonesUrl: string;
  maintenanceParkingUrl: string;
  mediaParkingUrl: string;
  mensBasketballUrl: string;
  motorcycleParkingUrl: string;
  motoristAssistanceUrl: string;
  moveInParkingUrl: string;
  moveOutParkingUrl: string;
  ms150Url: string;
  musterUrl: string;
  nightWeekendParkingUrl: string;
  nscParkingUrl: string;
  outdoorTrackParkingUrl: string;
  physicsFestUrl: string;
  retireeParkingUrl: string;
  ringDayUrl: string;
  savannahBananasUrl: string;
  secGroundsConferenceUrl: string;
  soccerParkingUrl: string;
  softballParkingUrl: string;
  softballRegionalsUrl: string;
  spiritOf150WeekUrl: string;
  staffParkingUrl: string;
  studentParkingUrl: string;
  summerCommencementUrl: string;
  swimmingParkingUrl: string;
  tennisParkingUrl: string;
  timedParkingUrl: string;
  kickoffAtKyleUrl: string;
  liveAtTheStationUrl: string;
  troubadourFestivalUrl: string;
  vendorParkingUrl: string;
  visitorParkingUrl: string;
  volleyballParkingUrl: string;
  womensBasketballUrl: string;
  fourHRoundupUrl: string;
  micromobilityUrl: string;
  ncaaVolleyballUrl: string;
  gisDayUrl: string;
  argentinaVsHondurasUrl: string;
  fishCampUrl: string;
  busRoutesUrl: string;
  tCampUrl: string;
  fireSchoolUrl: string;
  beefCattleUrl: string;
  gamesOfTexasUrl: string;
  galvestonBasemapUrl: string;
  galvestonFeatureServerUrl: string;
  mcallenBasemapUrl: string;
  mcallenFeatureServerUrl: string;
  dcBushSchoolBasemapUrl: string;
  dcBushSchoolFeatureServerUrl: string;
  fortWorthLawBasemapUrl: string;
  fortWorthLawFeatureServerUrl: string;
  houstonSpaceInstituteBasemapUrl: string;
  houstonSpaceInstituteFeatureServerUrl: string;
  maysCityCenterBasemapUrl: string;
  maysCityCenterFeatureServerUrl: string;
  hscRoundRockBasemapUrl: string;
  hscRoundRockFeatureServerUrl: string;
  hscKingsvilleBasemapUrl: string;
  hscKingsvilleFeatureServerUrl: string;
  hscCorpusChristiBasemapUrl: string;
  hscCorpusChristiFeatureServerUrl: string;
  hscDallasBasemapUrl: string;
  hscDallasFeatureServerUrl: string;
}
