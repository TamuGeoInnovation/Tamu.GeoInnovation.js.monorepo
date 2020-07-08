import { Popups } from '@tamu-gisc/aggiemap';

export const Connections = {
  basemapUrl: 'https://gis.tamu.edu/arcgis/rest/services/FCOR/TAMU_BaseMap/MapServer',
  inforUrl: 'https://gis.tamu.edu/arcgis/rest/services/FCOR/MapInfo_20190529/MapServer',
  accessibleUrl: 'https://fc-gis.tamu.edu/arcgis/rest/services/FCOR/ADA_120717/MapServer/0',
  constructionUrl: 'https://gis.tamu.edu/arcgis/rest/services/FCOR/Construction_2018/MapServer',
  departmentUrl: 'https://fc-gis.tamu.edu/arcgis/rest/services/FCOR/DepartmentSearch/MapServer/1',
  tsMainUrl: 'https://gis.tamu.edu/arcgis/rest/services/TS/TS_Main/MapServer',
  bikeRacksUrl: 'https://gis.tamu.edu/arcgis/rest/services/TS/TS_Bicycles/MapServer/3',
  bikeLocationsUrl: 'http://nodes.geoservices.tamu.edu/api/veoride/bikes/?format=geojson&metadata=false&fields=lat,lon'
};

export const Definitions = {
  BUILDINGS: {
    id: 'buildings',
    layerId: 'buildings-layer',
    name: 'Buildings',
    url: `${Connections.basemapUrl}/1`,
    popupComponent: Popups.BuildingPopupComponent,
    category: 'Uncategorized'
  },
  DOMESTIC_COLD_WATER: {
    id: 'domestic-cold-water',
    layerId: 'domestic-cold-water-layer',
    name: 'Domestic Cold Water',
    url: 'https://ues-arc.tamu.edu/arcgis/rest/services/Yoho/Utilities_Distn_YOHO_WebMap/MapServer/0',
    category: 'Water'
  },
  DOMESTIC_WATER_VALVE: {
    id: 'domestic-water-valve',
    layerId: 'domestic-water-valve-layer',
    name: 'Domestic Water Valve',
    url: 'https://ues-arc.tamu.edu/arcgis/rest/services/Yoho/Utilities_Distn_YOHO_WebMap/MapServer/1',
    category: 'Water'
  },
  DOMESTIC_COLD_WATER_METER: {
    id: 'domestic-cold-water-meter',
    layerId: 'domestic-cold-water-meter-layer',
    name: 'Domestic Cold Water Meter',
    url: 'https://ues-arc.tamu.edu/arcgis/rest/services/Yoho/Utilities_Distn_YOHO_WebMap/MapServer/2',
    category: 'Water'
  },
  DOMESTIC_WATER_TRANSMISSION: {
    id: 'domestic-water-transmission',
    layerId: 'domestic-water-transmission-layer',
    name: 'Domestic Water Transmission',
    url: 'https://ues-arc.tamu.edu/arcgis/rest/services/Yoho/Utilities_Distn_YOHO_WebMap/MapServer/3',
    category: 'Water'
  },
  WELL_SITES: {
    id: 'well-sites',
    layerId: 'well-sites-layer',
    name: 'Well Sites',
    url: 'https://ues-arc.tamu.edu/arcgis/rest/services/Yoho/Utilities_Distn_YOHO_WebMap/MapServer/4',
    category: 'Water'
  },
  FIRE_HYDRANTS: {
    id: 'fire-hydrants',
    layerId: 'fire-hydrants-layer',
    name: 'Fire Hydrants',
    url: 'https://ues-arc.tamu.edu/arcgis/rest/services/Yoho/Utilities_Distn_YOHO_WebMap/MapServer/5',
    category: 'Water'
  },
  DOMESTIC_HOT_WATER: {
    id: 'domestic-hot-water',
    layerId: 'domestic-hot-water-layer',
    name: 'Domestic Hot Water',
    url: 'https://ues-arc.tamu.edu/arcgis/rest/services/Yoho/Utilities_Distn_YOHO_WebMap/MapServer/6',
    category: 'Water'
  },
  DOMESTIC_HOT_WATER_VALVE: {
    id: 'domestic-hot-water-valve',
    layerId: 'domestic-hot-water-valve-layer',
    name: 'Domestic Hot Water Valve',
    url: 'https://ues-arc.tamu.edu/arcgis/rest/services/Yoho/Utilities_Distn_YOHO_WebMap/MapServer/7',
    category: 'Water'
  },
  CHILLED_WATER: {
    id: 'chillded-water',
    layerId: 'chillded-water-layer',
    name: 'Chilled Water',
    url: 'https://ues-arc.tamu.edu/arcgis/rest/services/Yoho/Utilities_Distn_YOHO_WebMap/MapServer/8',
    category: 'Water'
  },
  CHILLED_WATER_VALVE: {
    id: 'chillded-water-valve',
    layerId: 'chillded-water-valve-layer',
    name: 'Chilled Water Valve',
    url: 'https://ues-arc.tamu.edu/arcgis/rest/services/Yoho/Utilities_Distn_YOHO_WebMap/MapServer/9',
    category: 'Water'
  },
  HEATING_HOT_WATER: {
    id: 'heating-hot-water',
    layerId: 'heating-hot-water-layer',
    name: 'Heating Hot Water',
    url: 'https://ues-arc.tamu.edu/arcgis/rest/services/Yoho/Utilities_Distn_YOHO_WebMap/MapServer/10',
    category: 'Water'
  },
  HEATING_HOT_WATER_VALVE: {
    id: 'heating-hot-water-valve',
    layerId: 'heating-hot-water-valve-layer',
    name: 'Heating Hot Water Valve',
    url: 'https://ues-arc.tamu.edu/arcgis/rest/services/Yoho/Utilities_Distn_YOHO_WebMap/MapServer/11',
    category: 'Water'
  },
  SANITARY_SEWER: {
    id: 'sanitary-sewer',
    layerId: 'sanitary-sewer-layer',
    name: 'Sanitary Sewer',
    url: 'https://ues-arc.tamu.edu/arcgis/rest/services/Yoho/Utilities_Distn_YOHO_WebMap/MapServer/12',
    category: 'Sanitary'
  },
  SANITARY_MANHOLES: {
    id: 'sanitary-manholes',
    layerId: 'sanitary-manholes-layer',
    name: 'Sanitary Manholes',
    url: 'https://ues-arc.tamu.edu/arcgis/rest/services/Yoho/Utilities_Distn_YOHO_WebMap/MapServer/13',
    category: 'Sanitary'
  },
  SANITARY_CLEANOUTS: {
    id: 'sanitary-cleanouts',
    layerId: 'sanitary-cleanouts-layer',
    name: 'Sanitary Cleanouts',
    url: 'https://ues-arc.tamu.edu/arcgis/rest/services/Yoho/Utilities_Distn_YOHO_WebMap/MapServer/14',
    category: 'Sanitary'
  },
  SANITARY_LIFT_STATION: {
    id: 'sanitary-lift-station',
    layerId: 'sanitary-lift-station-layer',
    name: 'Sanitary Lift Station',
    url: 'https://ues-arc.tamu.edu/arcgis/rest/services/Yoho/Utilities_Distn_YOHO_WebMap/MapServer/15',
    category: 'Sanitary'
  },
  STOMRMWATER: {
    id: 'stormwater',
    layerId: 'stormwater-layer',
    name: 'Stormwater',
    url: 'https://ues-arc.tamu.edu/arcgis/rest/services/Yoho/Utilities_Distn_YOHO_WebMap/MapServer/16',
    category: 'Stormwater'
  },
  STOMRMWATER_MANHOLE: {
    id: 'stormwater_manhole',
    layerId: 'stormwater_manhole-layer',
    name: 'Stormwater Manhole',
    url: 'https://ues-arc.tamu.edu/arcgis/rest/services/Yoho/Utilities_Distn_YOHO_WebMap/MapServer/17',
    category: 'Stormwater'
  },
  STORMWATER_CATCH_BASINS: {
    id: 'stormwater-catch-basins',
    layerId: 'stormwater-catch-basins-layer',
    name: 'Stormwater Catch Basins',
    url: 'https://ues-arc.tamu.edu/arcgis/rest/services/Yoho/Utilities_Distn_YOHO_WebMap/MapServer/18',
    category: 'Stormwater'
  },
  STORMWATER_OUTFALL_LOCATIONS: {
    id: 'stormwater-outfall-locations',
    layerId: 'stormwater-outfall-locations-layer',
    name: 'Stormwater Outfall Locations',
    url: 'https://ues-arc.tamu.edu/arcgis/rest/services/Yoho/Utilities_Distn_YOHO_WebMap/MapServer/19',
    category: 'Stormwater'
  },
  STORMWATER_DETENTION_BASIN: {
    id: 'stormwater-detention-basin',
    layerId: 'stormwater-detention-basin-layer',
    name: 'Stormwater Detention Basin',
    url: 'https://ues-arc.tamu.edu/arcgis/rest/services/Yoho/Utilities_Distn_YOHO_WebMap/MapServer/20',
    category: 'Stormwater'
  },
  STEAM: {
    id: 'steam',
    layerId: 'steam-layer',
    name: 'Steam',
    url: 'https://ues-arc.tamu.edu/arcgis/rest/services/Yoho/Utilities_Distn_YOHO_WebMap/MapServer/21',
    category: 'Steam'
  },
  UES_NATURAL_GAS: {
    id: 'ues-natural-gas',
    layerId: 'ues-natural-gas-layer',
    name: 'UES Natural Gas',
    url: 'https://ues-arc.tamu.edu/arcgis/rest/services/Yoho/Utilities_Distn_YOHO_WebMap/MapServer/22',
    category: 'Natural Gas'
  },
  UES_NATURAL_GAS_METERS: {
    id: 'ues-natural-gas-meters',
    layerId: 'ues-natural-gas-meters-layer',
    name: 'UES Natural Gas Meters',
    url: 'https://ues-arc.tamu.edu/arcgis/rest/services/Yoho/Utilities_Distn_YOHO_WebMap/MapServer/23',
    category: 'Natural Gas'
  },
  ELECTRICAL_SERVICE: {
    id: 'electrical-service',
    layerId: 'electrical-service-layer',
    name: 'Electrical Service',
    url: 'https://ues-arc.tamu.edu/arcgis/rest/services/Yoho/Utilities_Distn_YOHO_WebMap/MapServer/24',
    category: 'Electrical'
  },
  ELECTRICAL_MANHOLES: {
    id: 'electrical-manholes',
    layerId: 'electrical-manholes-layer',
    name: 'Electrical Manholes',
    url: 'https://ues-arc.tamu.edu/arcgis/rest/services/Yoho/Utilities_Distn_YOHO_WebMap/MapServer/25',
    category: 'Electrical'
  },
  ELECTRICAL_POLE: {
    id: 'electrical-pole',
    layerId: 'electrical-pole-layer',
    name: 'Electrical Pole',
    url: 'https://ues-arc.tamu.edu/arcgis/rest/services/Yoho/Utilities_Distn_YOHO_WebMap/MapServer/26',
    category: 'Electrical'
  },
  TRANSFORMER: {
    id: 'transformer',
    layerId: 'transformer-layer',
    name: 'Transformers',
    url: 'https://ues-arc.tamu.edu/arcgis/rest/services/Yoho/Utilities_Distn_YOHO_WebMap/MapServer/27',
    category: 'Electrical'
  },
  GENERATORS: {
    id: 'generator',
    layerId: 'generator-layer',
    name: 'Generators',
    url: 'https://ues-arc.tamu.edu/arcgis/rest/services/Yoho/Utilities_Distn_YOHO_WebMap/MapServer/28',
    category: 'Electrical'
  }
};
