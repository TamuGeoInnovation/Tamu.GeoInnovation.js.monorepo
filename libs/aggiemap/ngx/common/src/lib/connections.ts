function createConnections(gisHost: string): IComposedConnections {
  return {
    basemapUrl: `https://${gisHost}/arcgis/rest/services/FCOR/TAMU_BaseMap/MapServer`,
    inforUrl: `https://${gisHost}/arcgis/rest/services/FCOR/MapInfo_20190529/MapServer`,
    accessibleUrl: `https://${gisHost}/arcgis/rest/services/FCOR/ADA_120717/MapServer/0`,
    constructionUrl: `https://${gisHost}/arcgis/rest/services/FCOR/Construction_2018/MapServer`,
    departmentUrl: `https://${gisHost}/arcgis/rest/services/FCOR/DepartmentSearch/MapServer/1`,
    tsMainUrl: `https://${gisHost}/arcgis/rest/services/TS/TS_Main/MapServer`,
    bikeRacksUrl: `https://${gisHost}/arcgis/rest/services/TS/TS_Bicycles/MapServer/3`,
    bikeMapUrl: `https://${gisHost}/arcgis/rest/services/TS/BikeMap/MapServer`,
    bikeLocationsUrl: `https://veoride.geoservices.tamu.edu/api/vehicles/basic/geojson`,
    routingBaseUrl: `https://${gisHost}/arcgis/rest/services/Routing`,
    poiUrl: 'https://services1.arcgis.com/oxXAea6csqnDZ6WT/arcgis/rest/services/Points_of_Interest_view/FeatureServer',
    diningLocationsUrl: `https://api.aggiemap.tamu.edu/dining/locations/geojson`,
    aggiePrintUrl: 'https://services1.arcgis.com/qr14biwnHA6Vis6l/ArcGIS/rest/services/TAMUPrinters/FeatureServer',
    tsFootballUrl: `https://${gisHost}/arcgis/rest/services/TS/TSFootball/MapServer`,
    footballGamedayShuttlesUrl: `https://${gisHost}/arcgis/rest/services/TS/Ftbl_Gameday_Shuttles/MapServer`,
    maroonWhiteGameUrl: `https://${gisHost}/arcgis/rest/services/TS/Maroon_White_Game/MapServer`,
    accessibleParkingUrl: `https://${gisHost}/arcgis/rest/services/TS/AccessibleParking/MapServer`,
    aggieFamilyParadeUrl: `https://${gisHost}/arcgis/rest/services/TS/Aggie_Family_Parade/MapServer`,
    aggielandSaturdayUrl: `https://${gisHost}/arcgis/rest/services/TS/AggielandSaturday/MapServer`,
    avpParkingUrl: `https://${gisHost}/arcgis/rest/services/TS/AnyValidPermitParking/MapServer`,
    baseballParkingUrl: `https://${gisHost}/arcgis/rest/services/TS/BaseballParking/MapServer`,
    bigEventUrl: `https://${gisHost}/arcgis/rest/services/TS/Big_Event/MapServer`,
    breakSummerParkingUrl: `https://${gisHost}/arcgis/rest/services/TS/SummerBreakParking/MapServer`,
    businessParkingUrl: `https://${gisHost}/arcgis/rest/services/TS/BusinessParking/MapServer`,
    contractorParkingUrl: `https://${gisHost}/arcgis/rest/services/TS/ContractorParking/MapServer`,
    crossCountryParkingUrl: `https://${gisHost}/arcgis/rest/services/TS/CrossCountryParking/MapServer`,
    familyWeekendUrl: `https://${gisHost}/arcgis/rest/services/TS/Family_Weekend/MapServer`,
    freshmanParkingUrl: `https://${gisHost}/arcgis/rest/services/TS/FreshmanSelectableParking/MapServer`,
    graduationParkingUrl: `https://${gisHost}/arcgis/rest/services/TS/GraduationParking/MapServer`,
    hsGraduationUrl: `https://${gisHost}/arcgis/rest/services/TS/HS_Graduation/MapServer`,
    indoorTrackParkingUrl: `https://${gisHost}/arcgis/rest/services/TS/IndoorTrackParking/MapServer`,
    loadingZonesUrl: `https://${gisHost}/arcgis/rest/services/TS/Loading_Zones/MapServer`,
    maintenanceParkingUrl: `https://${gisHost}/arcgis/rest/services/TS/MaintenanceParking/MapServer`,
    mediaParkingUrl: `https://${gisHost}/arcgis/rest/services/TS/MediaParking/MapServer`,
    mensBasketballUrl: `https://${gisHost}/arcgis/rest/services/TS/BaseMBasketTennisXCountry/MapServer`,
    motorcycleParkingUrl: `https://${gisHost}/arcgis/rest/services/TS/MotorcycleParking/MapServer`,
    motoristAssistanceUrl: `https://${gisHost}/arcgis/rest/services/TS/MotoristAssistance/MapServer`,
    moveInParkingUrl: `https://${gisHost}/arcgis/rest/services/TS/FallMoveInParking/MapServer`,
    moveOutParkingUrl: `https://${gisHost}/arcgis/rest/services/TS/MoveOutParking/MapServer`,
    ms150Url: `https://${gisHost}/arcgis/rest/services/TS/MS150/MapServer`,
    musterUrl: `https://${gisHost}/arcgis/rest/services/TS/Muster/MapServer`,
    nightWeekendParkingUrl: `https://${gisHost}/arcgis/rest/services/TS/NightWeekendParking/MapServer`,
    nscParkingUrl: `https://${gisHost}/arcgis/rest/services/TS/NewStudentConferenceParking/MapServer`,
    outdoorTrackParkingUrl: `https://${gisHost}/arcgis/rest/services/TS/OutdoorTrackParking/MapServer`,
    physicsFestUrl: `https://${gisHost}/arcgis/rest/services/TS/Physics_Fest/MapServer`,
    retireeParkingUrl: `https://${gisHost}/arcgis/rest/services/TS/RetireeParking/MapServer`,
    ringDayUrl: `https://${gisHost}/arcgis/rest/services/TS/Ring_Day/MapServer`,
    savannahBananasUrl: `https://${gisHost}/arcgis/rest/services/TS/SavannahBananas/MapServer`,
    secGroundsConferenceUrl: `https://${gisHost}/arcgis/rest/services/TS/SEC_Grounds_Conference/MapServer`,
    soccerParkingUrl: `https://${gisHost}/arcgis/rest/services/TS/SoccerParking/MapServer`,
    softballParkingUrl: `https://${gisHost}/arcgis/rest/services/TS/SoftballParking/MapServer`,
    softballRegionalsUrl: `https://${gisHost}/arcgis/rest/services/TS/Softball_Regionals/MapServer`,
    staffParkingUrl: `https://${gisHost}/arcgis/rest/services/TS/StaffSelectableParking/MapServer`,
    studentParkingUrl: `https://${gisHost}/arcgis/rest/services/TS/StudentSelectableParking/MapServer`,
    summerCommencementUrl: `https://${gisHost}/arcgis/rest/services/TS/Summer_Commencement/MapServer`,
    swimmingParkingUrl: `https://${gisHost}/arcgis/rest/services/TS/SwimmingParking/MapServer`,
    tennisParkingUrl: `https://${gisHost}/arcgis/rest/services/TS/TennisParking/MapServer`,
    timedParkingUrl: `https://${gisHost}/arcgis/rest/services/TS/TimedParking/MapServer`,
    troubadourFestivalUrl: `https://${gisHost}/arcgis/rest/services/TS/Troubadour_Festival/MapServer`,
    vendorParkingUrl: `https://${gisHost}/arcgis/rest/services/TS/VendorParking/MapServer`,
    visitorParkingUrl: `https://${gisHost}/arcgis/rest/services/TS/VisitorParking/MapServer`,
    volleyballParkingUrl: `https://${gisHost}/arcgis/rest/services/TS/VolleyballParking/MapServer`,
    womensBasketballUrl: `https://${gisHost}/arcgis/rest/services/TS/TracSocSoftSwimVollWbask/MapServer`,
    fourHRoundupUrl: `https://${gisHost}/arcgis/rest/services/TS/4H_Roundup/MapServer`,
    gisDayUrl: 'https://services1.arcgis.com/qr14biwnHA6Vis6l/ArcGIS/rest/services/MSC_and_Rudder_Building_Polygon_Layer/FeatureServer',
    argentinaVsHondurasUrl: `https://${gisHost}/arcgis/rest/services/TS/Argentina_vs_Honduras26/MapServer`,
    // NOTE: TS/Fish_Camp is currently only published to the dev GIS host (gis-dev.it.tamu.edu) — it is
    // NOT yet on the production host. It resolves via `gisHost` like every other layer, so the dev
    // deployment loads it correctly; it will 404 on production until the service is published there.
    fishCampUrl: `https://${gisHost}/arcgis/rest/services/TS/Fish_Camp/MapServer`,
    // NOTE: hard-pinned to gis-dev. The Municipal_Fire_School_Vendor_Show service is only usable on
    // the dev GIS host — on production (gis.it.tamu.edu) it is published but token-protected, so the
    // `${gisHost}` form fails to load on localhost/prod (struck-through layers, empty legend). Revert
    // to `https://${gisHost}/...` once the prod service is public.
    fireSchoolUrl: `https://gis-dev.it.tamu.edu/arcgis/rest/services/TS/Municipal_Fire_School_Vendor_Show/MapServer`,
    // NOTE: hard-pinned to gis-dev. The Beef_Cattle_Vendor_Load_In service is only usable on the dev
    // GIS host — on production (gis.it.tamu.edu) it is published but token-protected, so the
    // `${gisHost}` form fails to load on localhost/prod (struck-through layers, empty legend). Revert
    // to `https://${gisHost}/...` once the prod service is public.
    beefCattleUrl: `https://gis-dev.it.tamu.edu/arcgis/rest/services/TS/Beef_Cattle_Vendor_Load_In/MapServer`,
    // NOTE: TS/Games_of_Texas is only published to the dev GIS host. On production it is either
    // absent or token-protected, so the `${gisHost}` form 401s/404s from localhost and prod. Pin to
    // the dev host so local dev (`npx nx serve`) loads it. Revert to `${gisHost}` once the service
    // is published publicly on production.
    gamesOfTexasUrl: `https://gis-dev.it.tamu.edu/arcgis/rest/services/TS/Games_of_Texas/MapServer`
  };
}

function getDefaultGisHost() {
  const hostname = globalThis.location?.hostname;

  return hostname?.includes('dev') ? 'gis-dev.it.tamu.edu' : 'gis.it.tamu.edu';
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
  fireSchoolUrl: string;
  beefCattleUrl: string;
  gamesOfTexasUrl: string;
}
