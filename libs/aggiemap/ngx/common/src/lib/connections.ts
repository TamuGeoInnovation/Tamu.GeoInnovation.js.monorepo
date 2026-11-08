import { TAMU_CAMPUS_BASEMAP_URL } from '@tamu-gisc/common/datasets/geographic';

import { actingAsProduction } from './acting-as-production';

/** Transportation's own host, where production reads its services (#2653). */
const PRODUCTION_TS_HOST = 'arc.ts.tamu.edu';

function createConnections(gisHost: string): IComposedConnections {
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
    // The services named on `PRODUCTION_TS_HOST` below are read from production on every environment, because the development
    // server cannot serve them yet: it has only the older MapServer each hosted view replaced, without `objectid`
    // (which the search sources and share links are built on) and the view's other fields, or, for the four retired
    // 150th-anniversary events, nothing. `connections.spec.ts` lists each with why, and fails on one pinned without
    // a reason (#2653). Publishing the hosted view on the development server is what lets one move.
    constructionUrl: `https://${PRODUCTION_TS_HOST}/arcgis/rest/services/Hosted/TSConstruction_Hosted/FeatureServer/0`,
    departmentUrl: `https://${gisHost}/arcgis/rest/services/FCOR/DepartmentSearch/MapServer/1`,
    // Read from production on every environment: layer 6 on the development server lacks the `GIS.TS.SPC_PNT_CNT.*`
    // space counts that the parking search and drive directions read (#2653).
    tsMainUrl: `https://${PRODUCTION_TS_HOST}/arcgis/rest/services/TS_Events/TS_Main/MapServer`,
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
    maroonWhiteGameUrl: `https://${PRODUCTION_TS_HOST}/arcgis/rest/services/Hosted/Maroon_White_Game_view/FeatureServer`,
    accessibleParkingUrl: `https://${PRODUCTION_TS_HOST}/arcgis/rest/services/Hosted/AccessibleParking_view/FeatureServer`,
    kickoff150thUrl: `https://${PRODUCTION_TS_HOST}/arcgis/rest/services/Hosted/150th_Kickoff/FeatureServer`,
    aggieFamilyParadeUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/Aggie_Family_Parade_view/FeatureServer`,
    aggielandSaturdayUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/AggielandSaturday_view/FeatureServer`,
    avpParkingUrl: `${tsEvents}/AnyValidPermitParking/MapServer`,
    baseballParkingUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/BaseballParking_view/FeatureServer`,
    bigEventUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/Big_Event_view/FeatureServer`,
    breakSummerParkingUrl: `${tsEvents}/SummerBreakParking/MapServer`,
    businessParkingUrl: `${tsEvents}/BusinessParking/MapServer`,
    contractorParkingUrl: `${tsEvents}/ContractorParking/MapServer`,
    crossCountryParkingUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/CrossCountryParking_view/FeatureServer`,
    familyWeekendUrl: `https://${PRODUCTION_TS_HOST}/arcgis/rest/services/Hosted/Family_Weekend_view/FeatureServer`,
    freshmanParkingUrl: `${tsEvents}/FreshmanSelectableParking/MapServer`,
    graduationParkingUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/GraduationParking_view/FeatureServer`,
    hsGraduationUrl: `${tsEvents}/HS_Graduation/MapServer`,
    indoorTrackParkingUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/IndoorTrackParking_view/FeatureServer`,
    loadingZonesUrl: `${tsEvents}/Loading_Zones/MapServer`,
    kickoffAtKyleUrl: `https://${PRODUCTION_TS_HOST}/arcgis/rest/services/Hosted/Kickoff_at_Kyle/FeatureServer`,
    liveAtTheStationUrl: `https://${PRODUCTION_TS_HOST}/arcgis/rest/services/Hosted/Live_at_the_Station/FeatureServer`,
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
    moveInParkingUrl: `https://${PRODUCTION_TS_HOST}/arcgis/rest/services/Hosted/FallMoveInParking_view/FeatureServer`,
    moveOutParkingUrl: `${tsEvents}/MoveOutParking/MapServer`,
    ms150Url: `https://${PRODUCTION_TS_HOST}/arcgis/rest/services/Hosted/MS150_view/FeatureServer`,
    // Development publishes Muster under another name, with the same layers and fields (#2653).
    musterUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/${development ? 'MusterParking_view' : 'Muster_view'}/FeatureServer`,
    nightWeekendParkingUrl: `${tsEvents}/NightWeekendParking/MapServer`,
    nscParkingUrl: `${tsEvents}/NewStudentConferenceParking/MapServer`,
    outdoorTrackParkingUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/OutdoorTrackParking_view/FeatureServer`,
    physicsFestUrl: `${tsEvents}/Physics_Fest/MapServer`,
    retireeParkingUrl: `${tsEvents}/RetireeParking/MapServer`,
    ringDayUrl: `https://${PRODUCTION_TS_HOST}/arcgis/rest/services/Hosted/Ring_Day_view/FeatureServer`,
    savannahBananasUrl: `https://${gisHost}/arcgis/rest/services/TS/SavannahBananas/MapServer`,
    secGroundsConferenceUrl: `${tsEvents}/SEC_Grounds_Conference/MapServer`,
    soccerParkingUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/SoccerParking_view/FeatureServer`,
    softballParkingUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/SoftballParking_view/FeatureServer`,
    softballRegionalsUrl: `https://${gisHost}/arcgis/rest/services/TS/Softball_Regionals/MapServer`,
    spiritOf150WeekUrl: `https://${PRODUCTION_TS_HOST}/arcgis/rest/services/Hosted/Spirit_of_150_Week/FeatureServer`,
    staffParkingUrl: `${tsEvents}/StaffSelectableParking/MapServer`,
    studentParkingUrl: `${tsEvents}/StudentSelectableParking/MapServer`,
    summerCommencementUrl: `https://${PRODUCTION_TS_HOST}/arcgis/rest/services/Hosted/Summer_Commencement_view/FeatureServer`,
    swimmingParkingUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/SwimmingParking_view/FeatureServer`,
    tennisParkingUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/TennisParking_view/FeatureServer`,
    timedParkingUrl: `${tsEvents}/TimedParking/MapServer`,
    troubadourFestivalUrl: `https://${gisHost}/arcgis/rest/services/TS/Troubadour_Festival/MapServer`,
    vendorParkingUrl: `${tsEvents}/VendorParking/MapServer`,
    visitorParkingUrl: `${tsEvents}/VisitorParking/MapServer`,
    volleyballParkingUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/VolleyballParking_view/FeatureServer`,
    womensBasketballUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/WomensBasketballParking_view/FeatureServer`,
    // Read from production on every environment: the development server has this view but answers 499
    // "Token Required", so a development build cannot read it at all (#2695). #2653 moved it on the strength
    // of the view existing on dev with matching fields, which is the wrong question - what matters is whether
    // a browser with no token can read it.
    fourHRoundupUrl: `https://${PRODUCTION_TS_HOST}/arcgis/rest/services/Hosted/4H_Roundup_view/FeatureServer`,
    // Read from production on every environment, as `fourHRoundupUrl` is: the development server answers 499 "Token
    // Required" (#2712). The map is development-only until the maintainer moves it, so production never reads it.
    micromobilityUrl: `https://${PRODUCTION_TS_HOST}/arcgis/rest/services/Hosted/Micromobility_Map_WFL1_view/FeatureServer`,
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
    tCampUrl: `https://${PRODUCTION_TS_HOST}/arcgis/rest/services/Hosted/T_Camp_view/FeatureServer`,
    fireSchoolUrl: `https://${PRODUCTION_TS_HOST}/arcgis/rest/services/Hosted/Municipal_Fire__School_Vendor_Show_view/FeatureServer`,
    beefCattleUrl: `https://${PRODUCTION_TS_HOST}/arcgis/rest/services/Hosted/Beef_Cattle_Vendor_Load_In_view/FeatureServer`,
    gamesOfTexasUrl: `https://${PRODUCTION_TS_HOST}/arcgis/rest/services/Hosted/Games_of_Texas_view/FeatureServer`,
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
  const gisHost = readsDevelopmentGisServer() ? 'gis-dev.it.tamu.edu' : 'gis.it.tamu.edu';
  // Transportation's services on the development server are under `TS`, not production's `TS_Events`; `Connections`
  // applies that and names the services development cannot serve yet (#2653).
  const tsgisHost = readsDevelopmentGisServer() ? 'gis.dev.tamu.edu' : PRODUCTION_TS_HOST;

  return { gisHost, tsgisHost } as { gisHost: string; tsgisHost: string };
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
