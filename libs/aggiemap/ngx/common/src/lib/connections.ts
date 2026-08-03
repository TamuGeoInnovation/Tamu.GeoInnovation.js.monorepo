function createConnections(gisHost: string): IComposedConnections {
  const tsgisHost = getDefaultGisHosts().tsgisHost;
  return {
    basemapUrl: `https://${gisHost}/arcgis/rest/services/FCOR/TAMU_BaseMap_060826/MapServer`,
    inforUrl: `https://${gisHost}/arcgis/rest/services/FCOR/MapInfo_20190529/MapServer`,
    accessibleUrl: `https://${gisHost}/arcgis/rest/services/FCOR/ADA_120717/MapServer/0`,
    constructionUrl: `https://${gisHost}/arcgis/rest/services/FCOR/Construction_2018/MapServer`,
    departmentUrl: `https://${gisHost}/arcgis/rest/services/FCOR/DepartmentSearch/MapServer/1`,
    tsMainUrl: `https://${tsgisHost}/arcgis/rest/services/TS_Events/TS_Main/MapServer`,
    bikeRacksUrl: `https://${gisHost}/arcgis/rest/services/TS/TS_Bicycles/MapServer/3`,
    bikeMapUrl: `https://${gisHost}/arcgis/rest/services/TS/BikeMap/MapServer`,
    bikeLocationsUrl: `https://veoride.geoservices.tamu.edu/api/vehicles/basic/geojson`,
    routingBaseUrl: `https://${gisHost}/arcgis/rest/services/Routing`,
    poiUrl: 'https://services1.arcgis.com/oxXAea6csqnDZ6WT/arcgis/rest/services/Points_of_Interest_view/FeatureServer',
    diningLocationsUrl: `https://api.aggiemap.tamu.edu/dining/locations/geojson`,
    aggiePrintUrl: 'https://services1.arcgis.com/qr14biwnHA6Vis6l/ArcGIS/rest/services/TAMUPrinters/FeatureServer',
    tsFootballUrl: `https://${gisHost}/arcgis/rest/services/TS/TSFootball/MapServer`,
    footballGamedayShuttlesUrl: `https://${gisHost}/arcgis/rest/services/TS/Ftbl_Gameday_Shuttles/MapServer`,
    maroonWhiteGameUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/Maroon_White_Game_view/FeatureServer`,
    accessibleParkingUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/AccessibleParking_view/FeatureServer`,
    aggieFamilyParadeUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/Aggie_Family_Parade_view/FeatureServer`,
    aggielandSaturdayUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/AggielandSaturday_view/FeatureServer`,
    avpParkingUrl: `https://${tsgisHost}/arcgis/rest/services/TS_Events/AnyValidPermitParking/MapServer`,
    baseballParkingUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/BaseballParking_view/FeatureServer`,
    bigEventUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/Big_Event_view/FeatureServer`,
    breakSummerParkingUrl: `https://${gisHost}/arcgis/rest/services/TS/SummerBreakParking/MapServer`,
    businessParkingUrl: `https://${tsgisHost}/arcgis/rest/services/TS_Events/BusinessParking/MapServer`,
    contractorParkingUrl: `https://${tsgisHost}/arcgis/rest/services/TS_Events/ContractorParking/MapServer`,
    crossCountryParkingUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/CrossCountryParking_view/FeatureServer`,
    familyWeekendUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/Family_Weekend_view/FeatureServer`,
    freshmanParkingUrl: `https://${tsgisHost}/arcgis/rest/services/TS_Events/FreshmanSelectableParking/MapServer`,
    graduationParkingUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/GraduationParking_view/FeatureServer`,
    hsGraduationUrl: `https://${tsgisHost}/arcgis/rest/services/TS_Events/HS_Graduation/MapServer`,
    indoorTrackParkingUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/IndoorTrackParking_view/FeatureServer`,
    loadingZonesUrl: `https://${tsgisHost}/arcgis/rest/services/TS_Events/Loading_Zones/MapServer`,
    maintenanceParkingUrl: `https://${tsgisHost}/arcgis/rest/services/TS_Events/MaintenanceParking/MapServer`,
    mediaParkingUrl: `https://${tsgisHost}/arcgis/rest/services/TS_Events/MediaParking/MapServer`,
    mensBasketballUrl: `https://${tsgisHost}/arcgis/rest/services/TS_Events/BaseMBasketTennisXCountry/MapServer`,
    motorcycleParkingUrl: `https://${tsgisHost}/arcgis/rest/services/TS_Events/MotorcycleParking/MapServer`,
    motoristAssistanceUrl: `https://${tsgisHost}/arcgis/rest/services/TS_Events/MotoristAssistance/MapServer`,
    moveInParkingUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/FallMoveInParking_view/FeatureServer`,
    moveOutParkingUrl: `https://${tsgisHost}/arcgis/rest/services/TS_Events/MoveOutParking/MapServer`,
    ms150Url: `https://${tsgisHost}/arcgis/rest/services/Hosted/MS150_view/FeatureServer`,
    musterUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/Muster_view/FeatureServer`,
    nightWeekendParkingUrl: `https://${tsgisHost}/arcgis/rest/services/TS_Events/NightWeekendParking/MapServer`,
    nscParkingUrl: `https://${tsgisHost}/arcgis/rest/services/TS_Events/NewStudentConferenceParking/MapServer`,
    outdoorTrackParkingUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/OutdoorTrackParking_view/FeatureServer`,
    physicsFestUrl: `https://${tsgisHost}/arcgis/rest/services/TS_Events/Physics_Fest/MapServer`,
    retireeParkingUrl: `https://${tsgisHost}/arcgis/rest/services/TS_Events/RetireeParking/MapServer`,
    ringDayUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/Ring_Day_view/FeatureServer`,
    savannahBananasUrl: `https://${gisHost}/arcgis/rest/services/TS/SavannahBananas/MapServer`,
    secGroundsConferenceUrl: `https://${tsgisHost}/arcgis/rest/services/TS_Events/SEC_Grounds_Conference/MapServer`,
    soccerParkingUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/SoccerParking_view/FeatureServer`,
    softballParkingUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/SoftballParking_view/FeatureServer`,
    softballRegionalsUrl: `https://${gisHost}/arcgis/rest/services/TS/Softball_Regionals/MapServer`,
    staffParkingUrl: `https://${tsgisHost}/arcgis/rest/services/TS_Events/StaffSelectableParking/MapServer`,
    studentParkingUrl: `https://${tsgisHost}/arcgis/rest/services/TS_Events/StudentSelectableParking/MapServer`,
    summerCommencementUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/Summer_Commencement_view/FeatureServer`,
    swimmingParkingUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/SwimmingParking_view/FeatureServer`,
    tennisParkingUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/TennisParking_view/FeatureServer`,
    timedParkingUrl: `https://${tsgisHost}/arcgis/rest/services/TS_Events/TimedParking/MapServer`,
    troubadourFestivalUrl: `https://${gisHost}/arcgis/rest/services/TS/Troubadour_Festival/MapServer`,
    vendorParkingUrl: `https://${tsgisHost}/arcgis/rest/services/TS_Events/VendorParking/MapServer`,
    visitorParkingUrl: `https://${tsgisHost}/arcgis/rest/services/TS_Events/VisitorParking/MapServer`,
    volleyballParkingUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/VolleyballParking_view/FeatureServer`,
    womensBasketballUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/WomensBasketballParking_view/FeatureServer`,
    fourHRoundupUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/4H_Roundup_view/FeatureServer`,
    gisDayUrl: 'https://services1.arcgis.com/qr14biwnHA6Vis6l/ArcGIS/rest/services/MSC_and_Rudder_Building_Polygon_Layer/FeatureServer',
    argentinaVsHondurasUrl: `https://${gisHost}/arcgis/rest/services/TS/Argentina_vs_Honduras26/MapServer`,
    fishCampUrl: `https://${tsgisHost}/arcgis/rest/services/TS_Events/Fish_Camp/MapServer`,
    tCampUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/T_Camp_view/FeatureServer`,
    fireSchoolUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/Municipal_Fire__School_Vendor_Show_view/FeatureServer`,
    beefCattleUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/Beef_Cattle_Vendor_Load_In_view/FeatureServer`,
    gamesOfTexasUrl: `https://${tsgisHost}/arcgis/rest/services/Hosted/Games_of_Texas_view/FeatureServer`
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
 * New: return both gisHost and tsgisHost for callers that need both base URLs.
 * Default values follow hostname-based dev detection:
 * - gisHost: 'gis-dev.it.tamu.edu' / 'gis.it.tamu.edu'
 * - tsgisHost: 'arc.ts-dev.tamu.edu' / 'arc.ts.tamu.edu'
 */
export function getDefaultGisHosts() {
  const hostname = globalThis.location?.hostname;
  const isDev = hostname?.includes('dev');

  const gisHost = isDev ? 'gis-dev.it.tamu.edu' : 'gis.it.tamu.edu';
  const tsgisHost = isDev ? 'arc.ts-dev.tamu.edu' : 'arc.ts.tamu.edu';

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
  constructionUrl: string;
  departmentUrl: string;
  tsMainUrl: string;
  bikeRacksUrl: string;
  bikeMapUrl: string;
  bikeLocationsUrl: string;
  routingBaseUrl: string;
  poiUrl: string;
  diningLocationsUrl: string;
  aggiePrintUrl: string;
  tsFootballUrl: string;
  footballGamedayShuttlesUrl: string;
  maroonWhiteGameUrl: string;
  accessibleParkingUrl: string;
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
  staffParkingUrl: string;
  studentParkingUrl: string;
  summerCommencementUrl: string;
  swimmingParkingUrl: string;
  tennisParkingUrl: string;
  timedParkingUrl: string;
  troubadourFestivalUrl: string;
  vendorParkingUrl: string;
  visitorParkingUrl: string;
  volleyballParkingUrl: string;
  womensBasketballUrl: string;
  fourHRoundupUrl: string;
  gisDayUrl: string;
  argentinaVsHondurasUrl: string;
  fishCampUrl: string;
  tCampUrl: string;
  fireSchoolUrl: string;
  beefCattleUrl: string;
  gamesOfTexasUrl: string;
}
