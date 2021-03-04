import { Popups } from '@tamu-gisc/aggiemap';
import { SearchSource, SearchSourceQueryParamsProperties } from '@tamu-gisc/search';
import { LayerSource, LegendItem } from '@tamu-gisc/common/types';

import esri = __esri;

export const Connections = {
  basemapUrl: 'https://gis.tamu.edu/arcgis/rest/services/FCOR/TAMU_BaseMap/MapServer',
  inforUrl: 'https://gis.tamu.edu/arcgis/rest/services/FCOR/MapInfo_20190529/MapServer',
  accessibleUrl: 'https://fc-gis.tamu.edu/arcgis/rest/services/FCOR/ADA_120717/MapServer/0',
  constructionUrl: 'https://gis.tamu.edu/arcgis/rest/services/FCOR/Construction_2018/MapServer',
  departmentUrl: 'https://fc-gis.tamu.edu/arcgis/rest/services/FCOR/DepartmentSearch/MapServer/1',
  tsMainUrl: 'https://gis.tamu.edu/arcgis/rest/services/TS/TS_Main/MapServer',
  bikeRacksUrl: 'https://gis.tamu.edu/arcgis/rest/services/TS/TS_Bicycles/MapServer/3',
  bikeLocationsUrl: 'http://nodes.geoservices.tamu.edu/api/veoride/bikes/?format=geojson&metadata=false&fields=lat,lon',
  distancedStudyAreasUrl: 'https://gis.tamu.edu/arcgis/rest/services/FCOR/Physical_Distancing_Tents/MapServer/706'
};

export const Definitions = {
  BUILDINGS: {
    id: 'buildings',
    layerId: 'buildings-layer',
    name: 'Buildings',
    url: `${Connections.basemapUrl}/1`,
    category: 'Uncategorized'
  },
  DOMESTIC_COLD_WATER: {
    id: 'domestic-cold-water',
    layerId: 'domestic-cold-water-layer',
    name: 'Domestic Cold Water',
    url: 'https://ues-arc.apogee.tamu.edu/arcgis/rest/services/Yoho/Utilities_Distn_YOHO_WebMap/MapServer/0',
    category: 'Water'
  },
  DOMESTIC_WATER_VALVE: {
    id: 'domestic-water-valve',
    layerId: 'domestic-water-valve-layer',
    name: 'Domestic Water Valve',
    url: 'https://ues-arc.apogee.tamu.edu/arcgis/rest/services/Yoho/Utilities_Distn_YOHO_WebMap/MapServer/1',
    category: 'Water'
  },
  DOMESTIC_COLD_WATER_METER: {
    id: 'domestic-cold-water-meter',
    layerId: 'domestic-cold-water-meter-layer',
    name: 'Domestic Cold Water Meter',
    url: 'https://ues-arc.apogee.tamu.edu/arcgis/rest/services/Yoho/Utilities_Distn_YOHO_WebMap/MapServer/2',
    category: 'Water'
  },
  DOMESTIC_WATER_TRANSMISSION: {
    id: 'domestic-water-transmission',
    layerId: 'domestic-water-transmission-layer',
    name: 'Domestic Water Transmission',
    url: 'https://ues-arc.apogee.tamu.edu/arcgis/rest/services/Yoho/Utilities_Distn_YOHO_WebMap/MapServer/3',
    category: 'Water'
  },
  WELL_SITES: {
    id: 'well-sites',
    layerId: 'well-sites-layer',
    name: 'Well Sites',
    url: 'https://ues-arc.apogee.tamu.edu/arcgis/rest/services/Yoho/Utilities_Distn_YOHO_WebMap/MapServer/4',
    category: 'Water'
  },
  FIRE_HYDRANTS: {
    id: 'fire-hydrants',
    layerId: 'fire-hydrants-layer',
    name: 'Fire Hydrants',
    url: 'https://ues-arc.apogee.tamu.edu/arcgis/rest/services/Yoho/Utilities_Distn_YOHO_WebMap/MapServer/5',
    category: 'Water'
  },
  DOMESTIC_HOT_WATER: {
    id: 'domestic-hot-water',
    layerId: 'domestic-hot-water-layer',
    name: 'Domestic Hot Water',
    url: 'https://ues-arc.apogee.tamu.edu/arcgis/rest/services/Yoho/Utilities_Distn_YOHO_WebMap/MapServer/6',
    category: 'Water'
  },
  DOMESTIC_HOT_WATER_VALVE: {
    id: 'domestic-hot-water-valve',
    layerId: 'domestic-hot-water-valve-layer',
    name: 'Domestic Hot Water Valve',
    url: 'https://ues-arc.apogee.tamu.edu/arcgis/rest/services/Yoho/Utilities_Distn_YOHO_WebMap/MapServer/7',
    category: 'Water'
  },
  CHILLED_WATER: {
    id: 'chillded-water',
    layerId: 'chillded-water-layer',
    name: 'Chilled Water',
    url: 'https://ues-arc.apogee.tamu.edu/arcgis/rest/services/Yoho/Utilities_Distn_YOHO_WebMap/MapServer/8',
    category: 'Water'
  },
  CHILLED_WATER_VALVE: {
    id: 'chillded-water-valve',
    layerId: 'chillded-water-valve-layer',
    name: 'Chilled Water Valve',
    url: 'https://ues-arc.apogee.tamu.edu/arcgis/rest/services/Yoho/Utilities_Distn_YOHO_WebMap/MapServer/9',
    category: 'Water'
  },
  HEATING_HOT_WATER: {
    id: 'heating-hot-water',
    layerId: 'heating-hot-water-layer',
    name: 'Heating Hot Water',
    url: 'https://ues-arc.apogee.tamu.edu/arcgis/rest/services/Yoho/Utilities_Distn_YOHO_WebMap/MapServer/10',
    category: 'Water'
  },
  HEATING_HOT_WATER_VALVE: {
    id: 'heating-hot-water-valve',
    layerId: 'heating-hot-water-valve-layer',
    name: 'Heating Hot Water Valve',
    url: 'https://ues-arc.apogee.tamu.edu/arcgis/rest/services/Yoho/Utilities_Distn_YOHO_WebMap/MapServer/11',
    category: 'Water'
  },
  SANITARY_SEWER: {
    id: 'sanitary-sewer',
    layerId: 'sanitary-sewer-layer',
    name: 'Sanitary Sewer',
    url: 'https://ues-arc.apogee.tamu.edu/arcgis/rest/services/Yoho/Utilities_Distn_YOHO_WebMap/MapServer/12',
    category: 'Sanitary'
  },
  SANITARY_MANHOLES: {
    id: 'sanitary-manholes',
    layerId: 'sanitary-manholes-layer',
    name: 'Sanitary Manholes',
    url: 'https://ues-arc.apogee.tamu.edu/arcgis/rest/services/Yoho/Utilities_Distn_YOHO_WebMap/MapServer/13',
    category: 'Sanitary'
  },
  SANITARY_CLEANOUTS: {
    id: 'sanitary-cleanouts',
    layerId: 'sanitary-cleanouts-layer',
    name: 'Sanitary Cleanouts',
    url: 'https://ues-arc.apogee.tamu.edu/arcgis/rest/services/Yoho/Utilities_Distn_YOHO_WebMap/MapServer/14',
    category: 'Sanitary'
  },
  SANITARY_LIFT_STATION: {
    id: 'sanitary-lift-station',
    layerId: 'sanitary-lift-station-layer',
    name: 'Sanitary Lift Station',
    url: 'https://ues-arc.apogee.tamu.edu/arcgis/rest/services/Yoho/Utilities_Distn_YOHO_WebMap/MapServer/15',
    category: 'Sanitary'
  },
  STOMRMWATER: {
    id: 'stormwater',
    layerId: 'stormwater-layer',
    name: 'Stormwater',
    url: 'https://ues-arc.apogee.tamu.edu/arcgis/rest/services/Yoho/Utilities_Distn_YOHO_WebMap/MapServer/16',
    category: 'Stormwater'
  },
  STOMRMWATER_MANHOLE: {
    id: 'stormwater_manhole',
    layerId: 'stormwater_manhole-layer',
    name: 'Stormwater Manhole',
    url: 'https://ues-arc.apogee.tamu.edu/arcgis/rest/services/Yoho/Utilities_Distn_YOHO_WebMap/MapServer/17',
    category: 'Stormwater'
  },
  STORMWATER_CATCH_BASINS: {
    id: 'stormwater-catch-basins',
    layerId: 'stormwater-catch-basins-layer',
    name: 'Stormwater Catch Basins',
    url: 'https://ues-arc.apogee.tamu.edu/arcgis/rest/services/Yoho/Utilities_Distn_YOHO_WebMap/MapServer/18',
    category: 'Stormwater'
  },
  STORMWATER_OUTFALL_LOCATIONS: {
    id: 'stormwater-outfall-locations',
    layerId: 'stormwater-outfall-locations-layer',
    name: 'Stormwater Outfall Locations',
    url: 'https://ues-arc.apogee.tamu.edu/arcgis/rest/services/Yoho/Utilities_Distn_YOHO_WebMap/MapServer/19',
    category: 'Stormwater'
  },
  STORMWATER_DETENTION_BASIN: {
    id: 'stormwater-detention-basin',
    layerId: 'stormwater-detention-basin-layer',
    name: 'Stormwater Detention Basin',
    url: 'https://ues-arc.apogee.tamu.edu/arcgis/rest/services/Yoho/Utilities_Distn_YOHO_WebMap/MapServer/20',
    category: 'Stormwater'
  },
  STEAM: {
    id: 'steam',
    layerId: 'steam-layer',
    name: 'Steam',
    url: 'https://ues-arc.apogee.tamu.edu/arcgis/rest/services/Yoho/Utilities_Distn_YOHO_WebMap/MapServer/21',
    category: 'Steam'
  },
  UES_NATURAL_GAS: {
    id: 'ues-natural-gas',
    layerId: 'ues-natural-gas-layer',
    name: 'UES Natural Gas',
    url: 'https://ues-arc.apogee.tamu.edu/arcgis/rest/services/Yoho/Utilities_Distn_YOHO_WebMap/MapServer/22',
    category: 'Natural Gas'
  },
  UES_NATURAL_GAS_METERS: {
    id: 'ues-natural-gas-meters',
    layerId: 'ues-natural-gas-meters-layer',
    name: 'UES Natural Gas Meters',
    url: 'https://ues-arc.apogee.tamu.edu/arcgis/rest/services/Yoho/Utilities_Distn_YOHO_WebMap/MapServer/23',
    category: 'Natural Gas'
  },
  ELECTRICAL_SERVICE: {
    id: 'electrical-service',
    layerId: 'electrical-service-layer',
    name: 'Electrical Service',
    url: 'https://ues-arc.apogee.tamu.edu/arcgis/rest/services/Yoho/Utilities_Distn_YOHO_WebMap/MapServer/24',
    category: 'Electrical'
  },
  ELECTRICAL_MANHOLES: {
    id: 'electrical-manholes',
    layerId: 'electrical-manholes-layer',
    name: 'Electrical Manholes',
    url: 'https://ues-arc.apogee.tamu.edu/arcgis/rest/services/Yoho/Utilities_Distn_YOHO_WebMap/MapServer/25',
    category: 'Electrical'
  },
  ELECTRICAL_POLE: {
    id: 'electrical-pole',
    layerId: 'electrical-pole-layer',
    name: 'Electrical Pole',
    url: 'https://ues-arc.apogee.tamu.edu/arcgis/rest/services/Yoho/Utilities_Distn_YOHO_WebMap/MapServer/26',
    category: 'Electrical'
  },
  TRANSFORMER: {
    id: 'transformer',
    layerId: 'transformer-layer',
    name: 'Transformers',
    url: 'https://ues-arc.apogee.tamu.edu/arcgis/rest/services/Yoho/Utilities_Distn_YOHO_WebMap/MapServer/27',
    category: 'Electrical'
  },
  GENERATORS: {
    id: 'generator',
    layerId: 'generator-layer',
    name: 'Generators',
    url: 'https://ues-arc.apogee.tamu.edu/arcgis/rest/services/Yoho/Utilities_Distn_YOHO_WebMap/MapServer/28',
    category: 'Electrical'
  },
  PAD_MOUNTED_SWITCHES: {
    id: 'pad-mounted-switches',
    layerId: 'pad-mounted-switches-layer',
    name: 'Pad Mounted Switches',
    url: 'https://ues-arc.apogee.tamu.edu/arcgis/rest/services/Yoho/Utilities_Distn_YOHO_WebMap/MapServer/29',
    category: 'Electrical'
  },
  FEEDERS: {
    id: 'feeders',
    layerId: 'feeders-layer',
    name: 'Feeders',
    url: 'https://ues-arc.apogee.tamu.edu/arcgis/rest/services/Yoho/Utilities_Distn_YOHO_WebMap/MapServer/30',
    category: 'Electrical'
  },
  FEEDER_BUILDINGS: {
    id: 'feeder-buildings',
    layerId: 'feeder-buildings-layer',
    name: 'Feeder Buildings',
    url: 'https://ues-arc.apogee.tamu.edu/arcgis/rest/services/Yoho/Utilities_Distn_YOHO_WebMap/MapServer/31',
    category: 'Electrical'
  },
  ONE_THIRTY_EIGHT_KILOVOLT: {
    id: 'one-thirty-eight-kilovolt',
    layerId: 'one-thirty-eight-kilovolt-layer',
    name: '138kV',
    url: 'https://ues-arc.apogee.tamu.edu/arcgis/rest/services/Yoho/Utilities_Distn_YOHO_WebMap/MapServer/32',
    category: 'Electrical'
  },
  LIGHT_POLES: {
    id: 'light-poles',
    layerId: 'light-poles-layer',
    name: 'Light Poles',
    url: 'https://ues-arc.apogee.tamu.edu/arcgis/rest/services/Yoho/Utilities_Distn_YOHO_WebMap/MapServer/33',
    category: 'Electrical'
  },
  POINTS_OF_INTEREST: {
    id: 'poi',
    layerId: 'poi-layer',
    name: 'Points of Interest',
    url: `${Connections.inforUrl}/0`,
    popupComponent: Popups.PoiPopupComponent
  },
  RESTROOMS: {
    id: 'restrooms',
    layerId: 'restrooms-layer',
    name: 'Restrooms',
    url: `${Connections.inforUrl}/1`,
    popupComponent: Popups.RestroomPopupComponent
  },
  LACTATION_ROOMS: {
    id: 'lactation-rooms',
    layerId: 'lactation-rooms-layer',
    name: 'Lactation Rooms',
    url: `${Connections.inforUrl}/2`,
    popupComponent: Popups.LactationPopupComponent
  },
  VISITOR_PARKING: {
    id: 'visitor-parking',
    layerId: 'visitor-parking-layer',
    name: 'Visitor Parking',
    url: `${Connections.inforUrl}/3`,
    popupComponent: Popups.ParkingKioskPopupComponent
  },
  EMERGENCY_PHONES: {
    id: 'emergency-phones',
    layerId: 'emergency-phones-layer',
    name: 'Emergency Phones',
    url: `${Connections.inforUrl}/4`
  },
  DISTANCED_STUDY_AREAS: {
    id: 'distanced-study-area',
    layerId: 'distanced-study-area-layer',
    name: 'Physical Distance Study Area',
    url: Connections.distancedStudyAreasUrl
  }
};

const commonLayerProps = {
  outFields: ['*'],
  minScale: 100000,
  maxScale: 0,
  elevationInfo: { mode: 'relative-to-ground', offset: 1 } as esri.FeatureLayerElevationInfo,
  popupEnabled: false
};

// Persistent layer definitions that will be processed by a factory and added to the map.
export const LayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: Definitions.BUILDINGS.layerId,
    title: Definitions.BUILDINGS.name,
    url: Definitions.BUILDINGS.url,
    popupComponent: Popups.BuildingPopupComponent,
    listMode: 'hide',
    loadOnInit: true,
    visible: true,
    layerIndex: 1,
    native: {
      ...commonLayerProps,
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-fill',
          style: 'solid',
          color: [0, 0, 0, 0.01],
          outline: {
            width: '0'
          }
        }
      }
    }
  },
  {
    type: 'feature',
    id: Definitions.DOMESTIC_COLD_WATER.layerId,
    title: Definitions.DOMESTIC_COLD_WATER.name,
    url: Definitions.DOMESTIC_COLD_WATER.url,
    category: Definitions.DOMESTIC_COLD_WATER.category,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.BaseDirectionsComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: Definitions.DOMESTIC_WATER_VALVE.layerId,
    title: Definitions.DOMESTIC_WATER_VALVE.name,
    url: Definitions.DOMESTIC_WATER_VALVE.url,
    category: Definitions.DOMESTIC_COLD_WATER_METER.category,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.BaseDirectionsComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: Definitions.DOMESTIC_COLD_WATER_METER.layerId,
    title: Definitions.DOMESTIC_COLD_WATER_METER.name,
    url: Definitions.DOMESTIC_COLD_WATER_METER.url,
    category: Definitions.DOMESTIC_COLD_WATER_METER.category,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.BaseDirectionsComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: Definitions.DOMESTIC_WATER_TRANSMISSION.layerId,
    title: Definitions.DOMESTIC_WATER_TRANSMISSION.name,
    url: Definitions.DOMESTIC_WATER_TRANSMISSION.url,
    category: Definitions.DOMESTIC_WATER_TRANSMISSION.category,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.BaseDirectionsComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: Definitions.WELL_SITES.layerId,
    title: Definitions.WELL_SITES.name,
    url: Definitions.WELL_SITES.url,
    category: Definitions.WELL_SITES.category,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.BaseDirectionsComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: Definitions.FIRE_HYDRANTS.layerId,
    title: Definitions.FIRE_HYDRANTS.name,
    url: Definitions.FIRE_HYDRANTS.url,
    category: Definitions.FIRE_HYDRANTS.category,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.BaseDirectionsComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: Definitions.DOMESTIC_HOT_WATER.layerId,
    title: Definitions.DOMESTIC_HOT_WATER.name,
    url: Definitions.DOMESTIC_HOT_WATER.url,
    category: Definitions.DOMESTIC_HOT_WATER.category,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.BaseDirectionsComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: Definitions.DOMESTIC_HOT_WATER_VALVE.layerId,
    title: Definitions.DOMESTIC_HOT_WATER_VALVE.name,
    url: Definitions.DOMESTIC_HOT_WATER_VALVE.url,
    category: Definitions.DOMESTIC_HOT_WATER_VALVE.category,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.BaseDirectionsComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: Definitions.CHILLED_WATER.layerId,
    title: Definitions.CHILLED_WATER.name,
    url: Definitions.CHILLED_WATER.url,
    category: Definitions.CHILLED_WATER.category,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.BaseDirectionsComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: Definitions.CHILLED_WATER_VALVE.layerId,
    title: Definitions.CHILLED_WATER_VALVE.name,
    url: Definitions.CHILLED_WATER_VALVE.url,
    category: Definitions.CHILLED_WATER_VALVE.category,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.BaseDirectionsComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: Definitions.HEATING_HOT_WATER.layerId,
    title: Definitions.HEATING_HOT_WATER.name,
    url: Definitions.HEATING_HOT_WATER.url,
    category: Definitions.HEATING_HOT_WATER.category,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.BaseDirectionsComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: Definitions.HEATING_HOT_WATER_VALVE.layerId,
    title: Definitions.HEATING_HOT_WATER_VALVE.name,
    url: Definitions.HEATING_HOT_WATER_VALVE.url,
    category: Definitions.HEATING_HOT_WATER_VALVE.category,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.BaseDirectionsComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: Definitions.SANITARY_SEWER.layerId,
    title: Definitions.SANITARY_SEWER.name,
    url: Definitions.SANITARY_SEWER.url,
    category: Definitions.SANITARY_SEWER.category,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.BaseDirectionsComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: Definitions.SANITARY_MANHOLES.layerId,
    title: Definitions.SANITARY_MANHOLES.name,
    url: Definitions.SANITARY_MANHOLES.url,
    category: Definitions.SANITARY_MANHOLES.category,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.BaseDirectionsComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: Definitions.SANITARY_CLEANOUTS.layerId,
    title: Definitions.SANITARY_CLEANOUTS.name,
    url: Definitions.SANITARY_CLEANOUTS.url,
    category: Definitions.SANITARY_CLEANOUTS.category,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.BaseDirectionsComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: Definitions.SANITARY_LIFT_STATION.layerId,
    title: Definitions.SANITARY_LIFT_STATION.name,
    url: Definitions.SANITARY_LIFT_STATION.url,
    category: Definitions.SANITARY_LIFT_STATION.category,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.BaseDirectionsComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: Definitions.STOMRMWATER.layerId,
    title: Definitions.STOMRMWATER.name,
    url: Definitions.STOMRMWATER.url,
    category: Definitions.STOMRMWATER.category,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.BaseDirectionsComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: Definitions.STOMRMWATER_MANHOLE.layerId,
    title: Definitions.STOMRMWATER_MANHOLE.name,
    url: Definitions.STOMRMWATER_MANHOLE.url,
    category: Definitions.STOMRMWATER_MANHOLE.category,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.BaseDirectionsComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: Definitions.STORMWATER_CATCH_BASINS.layerId,
    title: Definitions.STORMWATER_CATCH_BASINS.name,
    url: Definitions.STORMWATER_CATCH_BASINS.url,
    category: Definitions.STORMWATER_CATCH_BASINS.category,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.BaseDirectionsComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: Definitions.STORMWATER_OUTFALL_LOCATIONS.layerId,
    title: Definitions.STORMWATER_OUTFALL_LOCATIONS.name,
    url: Definitions.STORMWATER_OUTFALL_LOCATIONS.url,
    category: Definitions.STORMWATER_OUTFALL_LOCATIONS.category,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.BaseDirectionsComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: Definitions.STORMWATER_DETENTION_BASIN.layerId,
    title: Definitions.STORMWATER_DETENTION_BASIN.name,
    url: Definitions.STORMWATER_DETENTION_BASIN.url,
    category: Definitions.STORMWATER_DETENTION_BASIN.category,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.BaseDirectionsComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: Definitions.STEAM.layerId,
    title: Definitions.STEAM.name,
    url: Definitions.STEAM.url,
    category: Definitions.STEAM.category,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.BaseDirectionsComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: Definitions.UES_NATURAL_GAS.layerId,
    title: Definitions.UES_NATURAL_GAS.name,
    url: Definitions.UES_NATURAL_GAS.url,
    category: Definitions.UES_NATURAL_GAS.category,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.BaseDirectionsComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: Definitions.UES_NATURAL_GAS_METERS.layerId,
    title: Definitions.UES_NATURAL_GAS_METERS.name,
    url: Definitions.UES_NATURAL_GAS_METERS.url,
    category: Definitions.UES_NATURAL_GAS_METERS.category,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.BaseDirectionsComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: Definitions.ELECTRICAL_SERVICE.layerId,
    title: Definitions.ELECTRICAL_SERVICE.name,
    url: Definitions.ELECTRICAL_SERVICE.url,
    category: Definitions.ELECTRICAL_SERVICE.category,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.BaseDirectionsComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: Definitions.ELECTRICAL_MANHOLES.layerId,
    title: Definitions.ELECTRICAL_MANHOLES.name,
    url: Definitions.ELECTRICAL_MANHOLES.url,
    category: Definitions.ELECTRICAL_MANHOLES.category,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.BaseDirectionsComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: Definitions.ELECTRICAL_POLE.layerId,
    title: Definitions.ELECTRICAL_POLE.name,
    url: Definitions.ELECTRICAL_POLE.url,
    category: Definitions.ELECTRICAL_POLE.category,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.BaseDirectionsComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: Definitions.TRANSFORMER.layerId,
    title: Definitions.TRANSFORMER.name,
    url: Definitions.TRANSFORMER.url,
    category: Definitions.TRANSFORMER.category,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.BaseDirectionsComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: Definitions.GENERATORS.layerId,
    title: Definitions.GENERATORS.name,
    url: Definitions.GENERATORS.url,
    category: Definitions.GENERATORS.category,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.BaseDirectionsComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: Definitions.PAD_MOUNTED_SWITCHES.layerId,
    title: Definitions.PAD_MOUNTED_SWITCHES.name,
    url: Definitions.PAD_MOUNTED_SWITCHES.url,
    category: Definitions.PAD_MOUNTED_SWITCHES.category,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.BaseDirectionsComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: Definitions.FEEDERS.layerId,
    title: Definitions.FEEDERS.name,
    url: Definitions.FEEDERS.url,
    category: Definitions.FEEDERS.category,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.BaseDirectionsComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: Definitions.FEEDER_BUILDINGS.layerId,
    title: Definitions.FEEDER_BUILDINGS.name,
    url: Definitions.FEEDER_BUILDINGS.url,
    category: Definitions.FEEDER_BUILDINGS.category,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.BaseDirectionsComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: Definitions.ONE_THIRTY_EIGHT_KILOVOLT.layerId,
    title: Definitions.ONE_THIRTY_EIGHT_KILOVOLT.name,
    url: Definitions.ONE_THIRTY_EIGHT_KILOVOLT.url,
    category: Definitions.ONE_THIRTY_EIGHT_KILOVOLT.category,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.BaseDirectionsComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: Definitions.LIGHT_POLES.layerId,
    title: Definitions.LIGHT_POLES.name,
    url: Definitions.LIGHT_POLES.url,
    category: Definitions.LIGHT_POLES.category,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.BaseDirectionsComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: 'construction-layer',
    title: 'Construction Zone',
    url: `${Connections.constructionUrl}`,
    category: 'Aggiemap',
    listMode: 'show',
    loadOnInit: true,
    visible: true,
    legendItems: [
      {
        id: 'construction-legend',
        title: 'Construction Area',
        src:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAENJREFUOI1jYaAyYKGZgf9DGf5TahjjagZGFnQBcg2DOYgFmyAlgLYupAYYYgaORsogNHA0Uig3kJIwhAUXC7oApQAAQ8kZ9+L+/N4AAAAASUVORK5CYII='
      }
    ],
    popupComponent: Popups.ConstructionPopupComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: 'accessible-entrances-layer',
    title: 'Accessible Entrances',
    url: `${Connections.accessibleUrl}`,
    category: 'Aggiemap',
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    legendItems: [
      {
        id: 'assisted-open-entrance-legend',
        title: 'Assisted Open Entrance',
        src:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAA3pJREFUSInNlVFoW2UUx3+9ye29TToVLzJat+EYCHsocyQPsVCCYbGrtAwELVuQjKHZw7RPfdiTSR722Je8LSK0SgZhDCmxhtA2oNW+zMIeBq0IDm23NNTbh7VNenNvbnxIe5fb29SKCJ63e7/v+//OOd93znHzH5v7fwEYuqb2ap34XNBDg16AXYPcQkZZ+leAgYjqEwUSmsAwDai3rIlu4qGoCpCWdJL5e8qzfwQIR9VEHeLnTwuE+0UCfolur4DXI7BTMVkvGzzfNhmfqMQ0kVg4qiZnp5TEsQChj9RcHYbHRiUuBbvwegTbutcjcO5sJwDzkzLT+R1SWS0eiqo9xSnl5pGAPc+HP491Eezvahegza4MeTlzysX4RCUWjqql1khsgIGI6qtDfGxUcogXF6ps7ZgABN+WeeVll239Yp9MZFAnU9DjAxHVegA2gCiQOH9a4FLQLv7nZp07X1atb1nqYPAdjyOSG1dPkClsIovcBfw2wNA1tVcTGA73i46cLz3SAFC6O1C3G0zP1wgHuxCEDgdkbFQildV8jhRpnfhoQMAv2Q6YZoNv5msAfBaRufNFlV/WTJ78oXPujU4HIOCXSGU1QtfVkeKkkrMALuipA91eu/dPftf59amJqwN8FyTeDejMLBosPqwdCjj5mtvSs0WwX6EH07P4sOl931mB8kad10821x/M1fhgxESW7fsP6jme6U7FtCDVXZMHe+l59JvJx/Eta9+WBo9Xavjfkh3nW80C7BrkRDfx9bJhFdHj5Rpbzfvl1ocSkti81O9+qLGyajL3oxOwXjYsPRtgIaMshaIqz7dfeDD/U9N7/5sC77/ntf67XLDy1S6zPxt8sllHefVFTayVmh2ru0HpsBSlxycqsfnJple3P32J2zjtcsjD5ZCzDsobBvfzGkB6v/nZAJJOUhOJTed3uDLkdQj8nc3MVVleNdEN0vv/bID8PeVZOKomU1ktfuaUi4t9slOljX2/WCVT0HFBstgyJxyvaHZKSYSias/4RCUWGdS5cfXEkcLlDYOZuaY4Jt/Ofm1v2Ye26+KUcjMcVUuZgh7PFDYZG5UI+CWriPbnwVqpzv28xvKqiQuSB8XbAvYjGYioOVnkbiqr+VJZrd3WtG6QLrYZn0eOzL2W6wcIXVdHDs7k7galdqPyWIBWK04quePubbW/AF6HYoeZu0A/AAAAAElFTkSuQmCC'
      },
      {
        id: 'Manual Open Entrance',
        title: 'Manual Open Entrance',
        src:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAA05JREFUSInNlU+IE3cUxz+/38ykY1JRlFKyENYl0LqLkWazFSzYg8XDQmRP4rWnCKV4qB48SJP04Gn3sjcDglCkrCchLXQRyxaL0JYllJRdKt1WumqoLdLDbjZ/Zn6vhyRjZpPIllLoO8289+b7+b03j9+z+Y/N/l8A2u32mGVZGaVUXETGAJRSZaXU6r8CiEgGKADZnk8p1XvMiwgiUvJ9v+g4ztN/BDDGFID8dt3wcKPF8kqLx88M65uGyYRmesri8EHN3GwsZ9t2zhhT1FoX9gQQkTKQrVQb3LjdYH3ThOLrmybwLS41mb8UJZ1y88aYuNb6wksB3ZNnv36wwyelnVEFhuzyQp2L533mZmM5Y0ytv5IQoNvzfKXa4LMvmsx/FA1i33zf4s59jwMuXP0gSu9P/LDW5tMv2ywuNTl21CE5EcmLSDAAuysobNcNN243eO2AIn3cDQKWrbhz3+P0CZvpPv/WtgBtAHLFLe7dPARwHZgJAdrt9hiQfbjRYn3T8M6UFYh4nnAk4QBwfNIJfLYdTFRglWqDdMrNDLTIsqwMwPJKa+CjJzWP8YTDiTc1ySMOIi98u215pUU65WKMOau1LgcApVQc4PEzM/DRxqOO2LtvR4i/bvHnc5/6zmAewN1Vjyt9egFARMaUUgMjCVBZa3P61D5OnXTRWvHroxb79+uhgH69EKBnkwk9APm26tNoGF6NdUR//Mnj5ExkqPBkIgzub1EZyE9PWQMAzwi/PfF4IxnBGPjqu9GA6e5wdPVCgFUR4fDB4aX//EsH8PsfHrW/ZGgOQHK8I+l5Xi0EABCR0txsLLe41OTBms977z8PYgu3GizcagTvH17bBrZD4mcyNjNvvYKIlHqXXwjg+37Rtu3c/KUolxfqI085ys5lXWJRDVDq+UIAx3GeGmOK6ZSbv3jeZ3GpuWfxj3P7SE5EEJGi1jrYEwNTpLUuGGPic7Ox3LGjDrni1kuFz2RszmVdkhMRgM93X9lDr2ut9QVjTC05Ecnfu3mISrXB8kqLu6seQLAPkuOdnseiunfywm6tkQtHa13o7oXr6ZSbSadcrgzJE5ESUOpvy54A0BldureiMebs7p3seV5t1KrcE6DftNblveb2299DrV3F9KlErwAAAABJRU5ErkJggg=='
      }
    ],
    popupComponent: Popups.AccessiblePopupComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: Definitions.POINTS_OF_INTEREST.layerId,
    title: Definitions.POINTS_OF_INTEREST.name,
    url: Definitions.POINTS_OF_INTEREST.url,
    popupComponent: Definitions.POINTS_OF_INTEREST.popupComponent,
    category: 'Aggiemap',
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    legendItems: [
      {
        id: 'points-of-interest-legend',
        title: 'Points of Interest',
        src:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAlNJREFUOI291FFIU1EYB/D/XXO36a4xJuhoLFheTCKmrAmZjkAvDEwkDCfYGIP7sIFOhg+CIEKEkQMvDUkW1hR8CNdLDBaxknCIjCkJobBYLqc2rFEJZQ3p2kNM3HZVDOn/dPi+c37nnIdzxDjhiP8raAeoc21trXKV6hohEhXzPL+yHok8uRMKzR8XFD3o7HR9nJvrSk1NFaSyez33WTZBUpTZxnEzR4IOQKJh2fDKyEhVplbn8UCp0cDHMACAtbExdUF5+euxvr5ednDQdShY4XA8i7vdVftrlxkGZWo1AvX1+BEKAQB2YjHindc7NOp0frBznE8QHOroqIu73cbcTR7b7aBUqj0sEz6ZxJdY7JEF8E8Av/LAM0ql61MOJm9qgq69HbqGBrgCAfDJZFb/q99PXbJYrJiYGM0DU9GoNvd0GoMBdS0tKKKo3NZeZArFTQD54LfZ2dO5kxd6e3G1tfVQELu7pZlhFiilaX47HD518ErhiKXSn4JgqV7/OR4Olx0XlMpkb4RBmvbFga7jYJKKCmxtbt4TBBe6u3vOWq3shtcrzdTKzGYUFhUBAC7abHg7MJAFam22Vyan870geBfYCRqNN7ZWV59/n54mAEBWUoKXk5MAALKwEARJYjed/rtBf39KDDTtN/JeCmMyvZjx+1sWafppwuORxDgu75oESeLK8HD0fHV1jba2Nn0oCACG5mZ/JBiUXzAYHq4tL1/fmJ8vTq+vEwq9/rdap0uoKytv1zQ2jgutPfD70jPMNoBbWcWlJWBc0Dka/NecOPgHyxW6W4CVlHsAAAAASUVORK5CYII='
      }
    ],
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: Definitions.RESTROOMS.layerId,
    title: Definitions.RESTROOMS.name,
    url: Definitions.RESTROOMS.url,
    popupComponent: Definitions.RESTROOMS.popupComponent,
    category: 'Aggiemap',
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    legendItems: [
      {
        id: 'unisex-restroom-legend',
        title: 'Unisex Restrooms',
        src:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAkRJREFUOI29lF1IU2EYx3/bjhOn23T4gTPPURD8yJH2BWV4IYoURgTpReFFXVggdNVF5FUQZBFBRQlhtxZBCKGRQYFEF0p4YUZapqlhbalznp25ze2cbmS2dipx0v/qeZ/n//54ngfeVwB4MzT+2OtVGtAwsFUZDGputrVHAJj/5jvRfHV467B1Pb9S2yoAaMl09os0VJOgV+hud3G43sW1Oy+5/coNwNuuI4yMztLWNQZA3+UaKssLaL/0jP5Jf+yuLtBV7sSZ76CyNAfWgY6sdKwZqTFPRakTScylosT2d2CdmIbnh8y79zOkmgVSTQZCUS3Oc+t0GTNzi/jkVWr2iYxOLDMwHdAH3uioo3pXMQCVFSKCycipmyOxesfRQs6frY+dq1xFSIXZDLT1JQKldBOSmM2SV8aRZWXu6yJ7q4uADeCOfCtu9zJ5eZkAuN3L2G1p+iOfa5Lw+4OIhTkA2O0WLBYzOx0pcVMEQ2HdOAG4f7eIpm3sy26zMDProbVR+n0zf1QcsPPeEPevN8UZPn/x0N0/TcuxagDGJhYoFueRxFyUQJAVf5Dxj9/1gdPeMGZzCuG1CABr4Qi2jDQmV6Ixz91BD5GISmN9FR6PD0UJ0dI5rA+cXIlScLyHqUfNGI0GPk25abg4uOlxE4Dbof8DVAIholEVRQnFcqqqoq6/GM9SCFleZWFRxucL/BvoOvM0IVdy8kks7v0g09vwYPMdJiFVAHDm2V8/vLDnQDL/osGIlmm3vBAADh0sq92uFn8CQJrKeuGe9RUAAAAASUVORK5CYII='
      }
    ],
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: Definitions.LACTATION_ROOMS.layerId,
    title: Definitions.LACTATION_ROOMS.name,
    url: Definitions.LACTATION_ROOMS.url,
    popupComponent: Definitions.LACTATION_ROOMS.popupComponent,
    category: 'Aggiemap',
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    legendItems: [
      {
        id: 'lactation-rooms-legend',
        title: 'Lactation Rooms',
        src:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAfJJREFUOI211L9rE2EYwPGvEifvIKS0zRVSNRpE01RMLiASpYiCk3QQLyR/gAEzZikBwcFm0NKhHdqhi9JwNwj+gCLUwSFLiXEwjZTEIGS4HjfclCVTHS45ERpyyeEzPcf7vh8ennvfx8d/Ct8gyQaiCazunBfsBKFWpqE7cDYQTZy1ep/gnOStzt5xhqhcpqHbFVvdOe8oANIZuglA943c2o+0VqL945Dqy11X+13BL5p7XIpE4MljzHyOgnTHOzyfTtloP2aCQebTKTpqxRvcUSuY6wYzwSAApmGMRF3BANrmFpcXFwiFw3x9/9HNkdHww80CF69GEP1+AJaWH5FYusvWg6eTw8lilsyz0wGxqvEqqUwGK/ncP9+mYfDr8CdXFq4Tk+Mki9mh128onNZKzg+rf/tOTI7z5d0HPudfA/DmpIWSz40PX7t5w8nrB1XqB1X801OA3SIAQRCGHR8Oz0r2C//dauGfnkJVVkgWs+T2t7l9/x4A7aPm+HD7qElMjnNeFAmFw+T2t9nbeYu4bN8O0zDQ1jbGh7W1DWbX7T4Pei1dCLHzfJV66pbT67HhjlqhoNozIa2VAFCVFWdtVLh6eQNwnPCBPfmhdwx4nck1AoKO1YfLNPQMUbk/pCePgKDvWo2aU/EAB3RPsPU3/QN/+Jj7cGHLggAAAABJRU5ErkJggg=='
      }
    ],
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: Definitions.VISITOR_PARKING.layerId,
    title: Definitions.VISITOR_PARKING.name,
    url: Definitions.VISITOR_PARKING.url,
    popupComponent: Definitions.VISITOR_PARKING.popupComponent,
    category: 'Aggiemap',
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    legendItems: [
      {
        id: 'visitor-parking-legend',
        title: 'Visitor Parking',
        src:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAXlJREFUOI1jYaAyYIExzp2/t+Dth6/2DAz/GUk1hJGR8Z+oEO8MfT2FLriBN26/iIvqPUuyYTBwoMc5k4GBAWHgv/+oLnOQ4WRgZUbVdOXVT4bn3/9hNfDf/3/MDAxIXkYHG+ZFMvDzcaGI/f37j+HWnWcMLf0HGJZd+IBVH04DsQFmZiYGTXUZhqmdgQwvUlcw7Hv0nXQD5y85xJA05RIDAwMDQ76zBENjuSeDAD83Q1GSIcO+hmOUuXDi3hcMbva3GLzcDBlkZYSxqiHJQAYGBgY5qEFfvv0kz0AHG3WGU5pSDAyMjAwSYvwMsjIiDP///2fYsfcGeQYqKogzKCqIw/n//v1jWL/5DEPzxkfkGXjtxmOGZy8gSeTLl58MW/fcYZhz4g1O9QQNPHnmPjyWiQEkR8rgMXD63AMMHBysDMfPvSDPQPRipnLlPZIMYvzP8B/FQBkZwUtzc/S0//8nvTxkYmT8z83NfgjFQHtrLX1SDcIGqB4pABDucZbUZNfrAAAAAElFTkSuQmCC'
      }
    ],
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: Definitions.EMERGENCY_PHONES.layerId,
    title: Definitions.EMERGENCY_PHONES.name,
    url: Definitions.EMERGENCY_PHONES.url,
    category: 'Aggiemap',
    listMode: 'show',
    loadOnInit: true,
    visible: false,
    legendItems: [
      {
        id: 'emergency-phones-legend',
        title: 'Emergency Phone',
        src:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAXCAYAAADgKtSgAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAnxJREFUSIm11U+IVVUcwPHPKeNIq3jQS40xUhTExWwibSBwYzHEGDljjTI5EANugja6kVrMn1xFREKMEtRAihsZdGiR1m4ahBbNRuGBKzcztnjhIvRQclrcnvPe9c3cp9APDpd7z+9+v+ccfpzfJv9jbKpOyTW8FWPek5J6jB6kFFZjtJiSG4SHTwHPr5KnMYpnUwogJe3Pu+TPMUv4u0d4HsEc4fmKbb2ErzFGfpewWgHPH+FbhNFRLl2qwBfxOm6Q97cLOuAx5oGUzE5NCePj9PUxM8P8PKdOVQpewTz5TcI/JXgOKflm61bPHTvG9u3F1507OXmS48e5do3JSW7fXlewHxOYLa98CP0rK4yMcPkyO3asTdbrjI2xbx9DQzQa6wo+JZ8j5PaVv0dREcvLDA8XgnqduTmOHqVWY9cuFhY2FLxcq3mt2fTbI3iMYaBVZu2CvXu5cIGlJc6eXRNcvcqhQ90FzaYB2uAp2VJOWl4uBly8WDxbgt27C8GBA6ysdP4XY96SUueZx66bbItugulpJiYeS91MJ/wP9D2pYHDw8ZyUwt0y/FYv8JZgcLConm3bOHOG06c7Um6V4T/i7V7gJ05w5Mja++HDHfCEX8rwHzCFF6rgi4vcuVNUDcXZHzzI9euQv+eZv0rw8Cd5Bl9UwW/eLOp8YaEQNBotsHuEyVZe+eL6Em9guErQaBSCK1c4fx48jNEHKYVHhVmCh0z+EBkjvQj6+0nJfYynFH5qn+9y5Yb75PfxCT5DbSNBSpZqNR83m+H38tw6zSJkfEX+TtGJ3sEevIgHWCX/GmOYTyn83Gx2p1T00HAP5/4b3Va9YfTQoJ8+/gVFFNSWfmq/aAAAAABJRU5ErkJggg=='
      }
    ],
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: Definitions.DISTANCED_STUDY_AREAS.layerId,
    title: Definitions.DISTANCED_STUDY_AREAS.name,
    url: Definitions.DISTANCED_STUDY_AREAS.url,
    category: 'Aggiemap',
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.TentZonePopupComponent,
    legendItems: [
      {
        id: `${Definitions.DISTANCED_STUDY_AREAS.id}-legend`,
        title: Definitions.DISTANCED_STUDY_AREAS.name,
        src:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAByDd+UAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAA9pJREFUSInNlU1IXFcUx38zeTNXRa3RRW2tECG46dCSkOlAA2oXlYoBK1EKbroxWQgKDUkXxZBFxQQL+dgEYiJiaGhREmjLMBJj/AidEp2YRSSQ1oQu+kFCOtbW4Jw3nXldTK++efNmaiCUHhi4b+5993fP//zveQb/cRj/W6BlUQRqXzotNWtrvFZWxs+GoX4CiXk8JF4Y8NkztX95WT67coV9iYT4DANKS2F9HVIpYccO/rp1i7uBgPp4506ZfW5ga2traTgcXrcsKubn1eTFixJqaICDB8HrVfj9AoBpZsamifHgAcHLl2VmepqlUIj32tvflampqT+2BQyHw+uPH/P6yIiK1tdLeW8veL1bAAARhVKZsc8HgUDmt7TE3kuX1I/Dw1Pv1NWx0NLSUhaJRP4sCHz4kFfGxtRiZ6cU79pFDsA+Bkgmtw4SCChqaqRkbIz527d5MxSK/PCvGUYiKtbRsT2YztrjyTxbllBdDV1dSk1MyLfDw7x8+HAB4Pi4+rSqSl6tqysMs6zszOxhmoraWqGpiap797gAdOcDeldWpK+9PRvm8UAikQ0DsuoJ2UYC2LMHrl9XXSC9wEYO8PRpukIhyg0j86IGaJjHA+l0Zq2W0CmxUrJ5INNUHDggxYahPjp2TAZzgCJ0BwL53QgZt+osnXNOWZUS6uvh6lXpBNyAqrq8XDblcdbMHpkMM9mY5pakTllB4fNJuf3dTWBRkRTZ4HlhOjTMmaVTnZISFOAF0lnAVIqUXQ4d2o1OGS0LfD53Se3riotJAC8Bq1nAREJtgGRZ3a2e2jD5wlnbp09VCmRNP28CnzzZ+tN5z9wMsrCwpYDPJwSDmdo6G8M/+6ZzgLGYWlhdlb0VFRRBbi30BtogwWBuY9Bz+sCplKRiMb63H3QTuLzMxI0b7O/oIOh2z7LdV7gL6QPPzHA3GuWaK1BEomfPstbWxobfT3EhGJC3vwK6SSQHBpQJ8o0rEODOHTVw7px80tenmgvB3LLUmWl1RkfV9M2bMgok8wJFZO7Uqcr2UCieamigxQ5zulNffrdYXFRT3d3yKzDunMv5PMXj8SONjXw+OcmXzc3yAeCB7Aae7zMFWPPzleONjfESoAfbhc8LBNJNTU09bW3f9ff0yBeDg+z2etVbdondYMkkiydOVN4/eTKeBD7EIWUhILOzs78DR8+fV41nzsjR48flwqFD+GtrecPvlxqgCvgN+CUel6WRETb6+9kN8WvA1257FgTqEJE5YG5oSL09NMT7IvIIWLEt8QAbSqmvQGZwyPfcQBs4CkQLzG9nm+0DX2T8DXOPFlEg/aI+AAAAAElFTkSuQmCC'
      }
    ],
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'graphic',
    id: 'selection-layer',
    title: 'Selected Buildings',
    category: 'Infrastructure',
    listMode: 'hide',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.BaseDirectionsComponent
  }
];

// Static legend items
export const LegendSources: LegendItem[] = [
  {
    id: 'university-building-legend',
    title: 'University Building',
    src:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAJBJREFUOI1jYaAyYIExAtnZGygxaP3Pnw1wAwPZ2RuE7azruYVFyDLsw/2HDCkvXhirKCvPgruQW1iEQUJJmWwXMv386cPAzOzDQlgpaWDUwFEDRw0cZgZ+uP+QbEO+vn3DwIts4PqfPxsCL1xg+HThAgMDAwODsISEMamGimtooLoQVuIyMDAwMDwkw7VQPQDNmyRazmV6EgAAAABJRU5ErkJggg=='
  },
  {
    id: 'non-university-building-legend',
    title: 'Non-University Building',
    src:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAHFJREFUOI1jYaAyYIExmpqaGigxqK6urgFuYFNTU4OCBGe9EC8bWYY9ff2doampiaGurq4B7kIhXjYGZWk+sl348sMvBrgLqQlGDRw1cNTAYWbg09ffyTbk3edfqAbW1dU1NDU1wYsgcgBKAYssQCkAABa3ILBI1xApAAAAAElFTkSuQmCC'
  },
  {
    id: 'off-campus-building-legend',
    title: 'Off Campus Building',
    src:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAGdJREFUOI3t1KENADEMA8CADhBc2H0802cnLxVUdYRHH7U0LXrVKAo4GbnI4ZTvIGk7EAALkKTVWh9VTWHuLiQFgEVDVZXWWrph712i4clc8IIX/Bno7mlkjLGCAIxkTFAmy8DOj9281XsgH/GbKEkAAAAASUVORK5CYII='
  },
  {
    id: 'garage-parking-legend',
    title: 'Garage Parking',
    src:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAGtJREFUOI3t1LEOgCAMBNAOTMBgogNfezb3v4YQxdnJRldkMtzUdHi56Zx0jrsPkvoFAqAGktRlntYYfBO25SIkBYBawxi8pLQ0N9z3KtawZwY4wAH+DNxyaUaOer5BAErSJqglr4F9Pr7mAt2qILaQAOa8AAAAAElFTkSuQmCC'
  },
  {
    id: 'restricted-legend',
    title: 'Restricted 6am to 6pm',
    src:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABHNCSVQICAgIfAhkiAAAAFtJREFUOI1jYKAyYIQxHB0dGygxaP/+/Q0MDAwMLDDDQkMC6+OfviDLsFmiwnBDmWCC5BrGwMDAkPb6LZzNhEcdWWDUwFEDRw0cZgbCiiBywEJpCTib6gUs1QEATW0WjAt6JIYAAAAASUVORK5CYII='
  },
  {
    id: 'paved-surface-legend',
    title: 'Paved Surface',
    src:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAGVJREFUOI3t1CEOACEMBMAKdF+A4aN7zf62AsMLTl0DtqAurGoqJqu2yOGU7yBpOxAAC5Ck1VofVU1h7i4kBYBFQ1WV1lq6Ye9douHJXPCCF/wZ6O5pZIyxggCMZExQJsvAzo/dvKA4IK9bweSrAAAAAElFTkSuQmCC'
  },
  {
    id: 'sidewalk-legend',
    title: 'Sidewalk',
    src:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAEtJREFUOI1jYaAyYIExPr641UCJQfwSag1wA6GG1VNi4McXtxj4JdQaWAgrJQ2MGjhq4KiBowbS0UB+CbWGjy9uUWQQSgGLLEApAAAvoxCdulpoFwAAAABJRU5ErkJggg=='
  },
  {
    id: 'railroad-legend',
    title: 'Railroad',
    src:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAHhJREFUOI3tkrENgDAMBL+I9EUmYA7WYCfCTLBG5qBz/x0VRUAkAtIg8q3t+7dlh8pyDfgnIMnwBiQpJEBJI8mpMDQAWEnGYkIA0Xs/m9llM8kkTQlYRQnQzEJuHUk9gG5PeqiFBEhyKbnnzE4Jc3e5ow89dgM+1gZwZSYCkyusZQAAAABJRU5ErkJggg=='
  }
];

const commonQueryParams: Partial<SearchSourceQueryParamsProperties> = {
  f: 'json',
  resultRecordCount: 5,
  outFields: '*',
  outSR: 4326,
  returnGeometry: true,
  spatialRel: 'esriSpatialRelIntersects'
};

// Search sources used for querying features.
export const SearchSources: SearchSource[] = [
  {
    source: 'building',
    name: 'Building',
    url: `${Connections.basemapUrl}/1`,
    queryParams: {
      ...commonQueryParams,
      where: {
        keys: ['Number', 'BldgAbbr', 'BldgName'],
        operators: ['LIKE', 'LIKE', 'LIKE'],
        wildcards: ['includes', 'includes', 'includes'],
        transformations: ['UPPER', 'UPPER', 'UPPER']
      },
      scoringWhere: {
        keys: ['BldgName'],
        operators: ['LIKE'],
        wildcards: ['startsWith'],
        transformations: ['UPPER']
      }
    },
    scoringKeys: ['attributes.BldgAbbr', 'attributes.Number', 'attributes.BldgName'],
    featuresLocation: 'features',
    displayTemplate: '{attributes.BldgName} ({attributes.Number})',
    popupComponent: Popups.BuildingPopupComponent,
    searchActive: true
  },
  {
    source: 'building-exact',
    name: 'Building',
    url: `${Connections.basemapUrl}/1`,
    queryParams: {
      ...commonQueryParams,
      where: {
        keys: ['Number'],
        operators: ['=']
      }
    },
    featuresLocation: 'features',
    displayTemplate: '{attributes.BldgName} ({attributes.Number})',
    popupComponent: Popups.BuildingPopupComponent,
    searchActive: false
  },
  {
    source: 'university-departments',
    name: 'University Departments',
    url: `${Connections.departmentUrl}`,
    queryParams: {
      ...commonQueryParams,
      where: {
        keys: ['DeptName', 'CollegeName', 'DeptAbbre'],
        operators: ['LIKE', 'LIKE', 'LIKE'],
        wildcards: ['includes', 'includes', 'includes'],
        transformations: ['UPPER', 'UPPER', 'UPPER']
      }
    },
    featuresLocation: 'features',
    displayTemplate: '{attributes.DeptName}',
    popupComponent: Popups.BaseDirectionsComponent,
    searchActive: true,
    altLookup: {
      source: 'building-exact',
      reference: {
        keys: ['attributes.HOME1']
      }
    }
  },
  {
    source: 'university-departments-exact',
    name: 'University Departments',
    url: `${Connections.departmentUrl}`,
    queryParams: {
      ...commonQueryParams,
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
  {
    source: 'parking-garage',
    name: 'Parking Garage',
    url: `${Connections.basemapUrl}/0`,
    queryParams: {
      ...commonQueryParams,
      where: {
        keys: ['LotName', 'Name'],
        operators: ['LIKE', 'LIKE'],
        wildcards: ['includes', 'includes'],
        transformations: ['UPPER', 'UPPER']
      }
    },
    featuresLocation: 'features',
    displayTemplate: '{attributes.LotName}',
    popupComponent: Popups.BuildingPopupComponent,
    searchActive: true
  },
  {
    source: 'parking-lot',
    name: 'Parking Lot',
    url: `${Connections.basemapUrl}/12`,
    queryParams: {
      ...commonQueryParams,
      where: {
        keys: ['LotName'],
        operators: ['LIKE'],
        wildcards: ['includes'],
        transformations: ['UPPER']
      }
    },
    featuresLocation: 'features',
    displayTemplate: '{attributes.LotName}',
    popupComponent: Popups.ParkingLotPopupComponent,
    searchActive: true
  },
  {
    source: 'points-of-interest',
    name: 'Points of Interest',
    url: `${Connections.inforUrl}/0`,
    queryParams: {
      ...commonQueryParams,
      where: {
        keys: ['Name'],
        operators: ['LIKE'],
        wildcards: ['includes'],
        transformations: ['UPPER']
      }
    },
    featuresLocation: 'features',
    displayTemplate: '{attributes.Name}',
    popupComponent: Popups.PoiPopupComponent,
    searchActive: true
  },
  {
    source: 'bike-racks',
    name: 'Bike Racks',
    url: `${Connections.bikeRacksUrl}`,
    queryParams: {
      ...commonQueryParams,
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
  {
    source: Definitions.FIRE_HYDRANTS.id,
    name: Definitions.FIRE_HYDRANTS.name,
    url: Definitions.FIRE_HYDRANTS.url,
    featuresLocation: 'features',
    displayTemplate: '{attributes.HYDR_NUMBER}',
    popupComponent: Popups.BaseDirectionsComponent,
    searchActive: true,
    queryParams: {
      ...commonQueryParams,
      where: {
        keys: ['HYDR_NUMBER', 'ASSETNUM '],
        operators: ['LIKE', 'LIKE'],
        wildcards: ['includes', 'includes'],
        transformations: ['UPPER', 'UPPER']
      }
    }
  },
  {
    source: Definitions.GENERATORS.id,
    name: Definitions.GENERATORS.name,
    url: Definitions.GENERATORS.url,
    featuresLocation: 'features',
    displayTemplate: '{attributes.UES_ID}',
    popupComponent: Popups.BaseDirectionsComponent,
    searchActive: true,
    queryParams: {
      ...commonQueryParams,
      where: {
        keys: ['UES_ID', 'AIM_ASSET_NUMBER'],
        operators: ['LIKE', 'LIKE'],
        wildcards: ['includes', 'includes'],
        transformations: ['UPPER', 'UPPER']
      }
    }
  },
  {
    source: Definitions.TRANSFORMER.id,
    name: Definitions.TRANSFORMER.name,
    url: Definitions.TRANSFORMER.url,
    featuresLocation: 'features',
    displayTemplate: '{attributes.UESID}',
    popupComponent: Popups.BaseDirectionsComponent,
    searchActive: true,
    queryParams: {
      ...commonQueryParams,
      where: {
        keys: ['UESID', 'AIMNumber'],
        operators: ['LIKE', 'LIKE'],
        wildcards: ['includes', 'includes'],
        transformations: ['UPPER', 'UPPER']
      }
    }
  },
  {
    source: Definitions.ELECTRICAL_MANHOLES.id,
    name: Definitions.ELECTRICAL_MANHOLES.name,
    url: Definitions.ELECTRICAL_MANHOLES.url,
    featuresLocation: 'features',
    displayTemplate: '{attributes.MH_NUMBER}',
    popupComponent: Popups.BaseDirectionsComponent,
    searchActive: true,
    queryParams: {
      ...commonQueryParams,
      where: {
        keys: ['MH_NUMBER'],
        operators: ['LIKE'],
        wildcards: ['includes'],
        transformations: ['UPPER']
      }
    }
  },
  {
    source: Definitions.ELECTRICAL_MANHOLES.id,
    name: Definitions.ELECTRICAL_MANHOLES.name,
    url: Definitions.ELECTRICAL_MANHOLES.url,
    featuresLocation: 'features',
    displayTemplate: '{attributes.MH_NUMBER}',
    popupComponent: Popups.BaseDirectionsComponent,
    searchActive: true,
    queryParams: {
      ...commonQueryParams,
      where: {
        keys: ['MH_NUMBER'],
        operators: ['LIKE'],
        wildcards: ['includes'],
        transformations: ['UPPER']
      }
    }
  },
  {
    source: Definitions.DOMESTIC_COLD_WATER.id,
    name: Definitions.DOMESTIC_COLD_WATER.name,
    url: Definitions.DOMESTIC_COLD_WATER.url,
    featuresLocation: 'features',
    displayTemplate: '{attributes.OBJECTID}',
    popupComponent: Popups.BaseDirectionsComponent,
    searchActive: true,
    queryParams: {
      ...commonQueryParams,
      where: {
        keys: ['OBJECTID'],
        operators: ['LIKE'],
        wildcards: ['includes'],
        transformations: ['UPPER']
      }
    }
  },
  {
    source: Definitions.DOMESTIC_COLD_WATER.id,
    name: Definitions.DOMESTIC_COLD_WATER.name,
    url: Definitions.DOMESTIC_COLD_WATER.url,
    featuresLocation: 'features',
    displayTemplate: '{attributes.OBJECTID}',
    popupComponent: Popups.BaseDirectionsComponent,
    searchActive: true,
    queryParams: {
      ...commonQueryParams,
      where: {
        keys: ['OBJECTID'],
        operators: ['LIKE'],
        wildcards: ['includes'],
        transformations: ['UPPER']
      }
    }
  },
  {
    source: Definitions.UES_NATURAL_GAS_METERS.id,
    name: Definitions.UES_NATURAL_GAS_METERS.name,
    url: Definitions.UES_NATURAL_GAS_METERS.url,
    featuresLocation: 'features',
    displayTemplate: '{attributes.Meter_Number}',
    popupComponent: Popups.BaseDirectionsComponent,
    searchActive: true,
    queryParams: {
      ...commonQueryParams,
      where: {
        keys: ['Meter_Number'],
        operators: ['LIKE'],
        wildcards: ['includes'],
        transformations: ['UPPER']
      }
    }
  },
  {
    source: Definitions.WELL_SITES.id,
    name: Definitions.WELL_SITES.name,
    url: Definitions.WELL_SITES.url,
    featuresLocation: 'features',
    displayTemplate: '{attributes.WELL_NAME}',
    popupComponent: Popups.BaseDirectionsComponent,
    searchActive: true,
    queryParams: {
      ...commonQueryParams,
      where: {
        keys: ['WELL_NAME'],
        operators: ['LIKE'],
        wildcards: ['includes'],
        transformations: ['UPPER']
      }
    }
  }
];

export const SelectionSymbols = {
  polygon: {
    type: 'simple-fill',
    style: 'solid',
    color: [252, 227, 0, 0.55],
    outline: {
      color: [252, 227, 0, 0.8],
      width: '2px'
    }
  },
  point: {
    type: 'simple-marker',
    style: 'circle',
    size: 8,
    outline: {
      width: 2
    }
  },
  multipoint: {
    type: 'simple-marker',
    style: 'circle',
    size: 8,
    outline: {
      width: 2
    }
  }
};
