export const Connections = {
  basemapUrl: 'https://gis.tamu.edu/arcgis/rest/services/FCOR/BaseMap_20190813/MapServer',
  inforUrl: 'https://gis.tamu.edu/arcgis/rest/services/FCOR/MapInfo_20190529/MapServer',
  departmentUrl: 'https://fc-gis.tamu.edu/arcgis/rest/services/FCOR/DepartmentSearch/MapServer/1',
  tsMainUrl: 'https://gis.tamu.edu/arcgis/rest/services/TS/TS_Main/MapServer',
  bikeRacksUrl: 'https://gis.tamu.edu/arcgis/rest/services/TS/TS_Bicycles/MapServer/3',
  bikeLocationsUrl: 'http://18.189.207.133:5000/bikes',
  tripUrl: 'http://18.189.207.133:5000/trips'
};

export const Definitions = {
  BUILDINGS: {
    id: 'buildings',
    layerId: 'buildings-layer',
    name: 'Buildings',
    url: `${Connections.basemapUrl}/1`,
    popupComponent: 'BuildingPopupComponent'
  },
  TRANSPORTATION_PARKING: {
    id: 'transportation-parking',
    layerId: 'transportation-parking-layer',
    name: 'Transportation Parking',
    url: `${Connections.tsMainUrl}/6`,
    popupComponent: 'ParkingKioskPopupComponent'
  },
  BIKE_RACKS: {
    id: 'bike-racks',
    layerId: 'bike-racks-layer',
    name: 'Bike Racks',
    url: `${Connections.bikeRacksUrl}`
  },
  BIKE_LOCATIONS: {
    id: 'bike-locations',
    layerId: 'bike-locations-layer',
    name: 'VeoRide Bikes',
    url: `${Connections.bikeLocationsUrl}`
  },
  BIKE_HEATMAP: {
    id: 'bike-heatmap',
    layerId: 'bike-heatmap-layer',
    name: 'Bike Location Heatmap',
    url: `${Connections.bikeLocationsUrl}`
  },
  IDLE_HEATMAP: {
    id: 'idle-bike-heatmap',
    layerId: 'idle-bike-heatmap-layer',
    name: 'Idle Bike Heatmap',
    url: `${Connections.bikeLocationsUrl}`
  },
  ORIGIN_BIKE_HEATMAP: {
    id: 'origin-trip-heatmap',
    layerId: 'origin-trip-heatmap',
    name: 'Origin Trip Heatmap',
    url: `${Connections.tripUrl}/origin`
  },
  DESTINATION_BIKE_HEATMAP: {
    id: 'destination-trip-heatmap',
    layerId: 'destination-trip-layer',
    name: 'Destination Trip Heatmap',
    url: `${Connections.tripUrl}/destination`
  }
};
