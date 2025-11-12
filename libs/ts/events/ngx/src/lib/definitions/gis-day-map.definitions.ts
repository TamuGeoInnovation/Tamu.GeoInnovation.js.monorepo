import { LayerSource } from '@tamu-gisc/common/types';
import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import { MarkdownWDirectionsPopupComponent } from '../modules/popups/markdown-w-directions-popup/markdown-w-directions-popup.component';
import { EventConfiguration, ISpecialEventRoot, SpecialEventOptions } from '../interfaces/special-event.interface';

export enum GIS_DAY_LAYERS {
  MSC_RUDDER = 'gis-day-msc-rudder',
  GARAGES = 'gis-day-garages',
  CSG = 'gis-day-csg'
}

const GARAGES_URL =
  'https://services1.arcgis.com/qr14biwnHA6Vis6l/ArcGIS/rest/services/MSC_and_Rudder_Building_Polygon_Layer/FeatureServer/0';

const CSG_URL =
  'https://services1.arcgis.com/qr14biwnHA6Vis6l/ArcGIS/rest/services/MSC_and_Rudder_Building_Polygon_Layer/FeatureServer/1';

const MSC_RUDDER_URL =
  'https://services1.arcgis.com/qr14biwnHA6Vis6l/ArcGIS/rest/services/MSC_and_Rudder_Building_Polygon_Layer/FeatureServer/2';

export const GisDayLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: GIS_DAY_LAYERS.MSC_RUDDER,
    title: 'MSC & Rudder Buildings',
    url: MSC_RUDDER_URL,
    popupComponent: MarkdownWDirectionsPopupComponent,
    popupData: {
      name: 'attributes.Name',
      description: 'attributes.Description'
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: GIS_DAY_LAYERS.GARAGES,
    title: 'GIS Day Parking Garages',
    url: GARAGES_URL,
    popupComponent: MarkdownWDirectionsPopupComponent,
    popupData: {
      name: 'attributes.Name',
      description: 'attributes.Description'
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: GIS_DAY_LAYERS.CSG,
    title: 'Gene Stallings Parking Garage',
    url: CSG_URL,
    popupComponent: MarkdownWDirectionsPopupComponent,
    popupData: {
      name: 'attributes.Name',
      description: 'attributes.Description'
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  }
];

export const GisDayConfiguration: EventConfiguration = {
  id: 'gis-day',
  name: 'GIS Day',
  applicationName: 'GIS Day Event Map',
  shortApplicationName: 'GIS Day',
  introductionText: 'Building and parking locations for GIS Day.',
  eventDates: ['2025-11-17', '2025-11-18', '2025-11-19', '2025-11-20', '2025-11-21'],
  mapCenter: [-96.3379, 30.61286],
  zoom: 16
};

export const GisDayOptions: SpecialEventOptions = [];

export const GisDayTs: ISpecialEventRoot = {
  configuration: GisDayConfiguration,
  options: GisDayOptions,
  sources: GisDayLayerSources,
  references: GIS_DAY_LAYERS,
  discover: {
    id: GisDayConfiguration.id,
    name: GisDayConfiguration.name,
    description: 'Building and parking location information for GIS Day.',
    source: 'internal',
    type: 'event',
    keywords: ['gis', 'msc', 'rudder', 'parking']
  }
};
