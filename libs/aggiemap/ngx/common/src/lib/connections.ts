export function Connections(gisHost: string) {
  return {
    basemapUrl: `https://${gisHost}/arcgis/rest/services/FCOR/TAMU_BaseMap/MapServer`,
    inforUrl: `https://${gisHost}/arcgis/rest/services/FCOR/MapInfo_20190529/MapServer`,
    accessibleUrl: `https://${gisHost}/arcgis/rest/services/FCOR/ADA_120717/MapServer/0`,
    constructionUrl: `https://${gisHost}/arcgis/rest/services/FCOR/Construction_2018/MapServer`,
    departmentUrl: `https://${gisHost}/arcgis/rest/services/FCOR/DepartmentSearch/MapServer/1`,
    tsMainUrl: `https://${gisHost}/arcgis/rest/services/TS/TS_Main/MapServer`,
    bikeRacksUrl: `https://${gisHost}/arcgis/rest/services/TS/TS_Bicycles/MapServer/3`,
    bikeLocationsUrl: `https://veoride.geoservices.tamu.edu/api/vehicles/basic/geojson`,
    routingBaseUrl: `https://${gisHost}/arcgis/rest/services/Routing`
  };
}

export interface IComposedConnections {
  basemapUrl: string;
  inforUrl: string;
  accessibleUrl: string;
  constructionUrl: string;
  departmentUrl: string;
  tsMainUrl: string;
  bikeRacksUrl: string;
  bikeLocationsUrl: string;
}
