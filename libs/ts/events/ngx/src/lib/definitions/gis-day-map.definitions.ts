import { LayerSource } from '@tamu-gisc/common/types';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import { EventConfiguration, ISpecialEventRoot, SpecialEventOptions } from '../interfaces/special-event.interface';
export enum GIS_DAY_LAYERS {
  GIS_DAY_MSC = 'gis-day-msc'
}
const gisDayUrl = 'https://services1.arcgis.com/qr14biwnHA6Vis6l/ArcGIS/rest/services/MSC_and_Rudder_Building_Polygon_Layer/FeatureServer/0'

const GisDayEventDefinitions = {
  MSC: {
    id: GIS_DAY_LAYERS.GIS_DAY_MSC,
    layerId: GIS_DAY_LAYERS.GIS_DAY_MSC,
    name: 'GIS Day – MSC',
    url: gisDayUrl
  }
};

export const GisDayLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: GisDayEventDefinitions.MSC.id,
    title: GisDayEventDefinitions.MSC.name,
    url: GisDayEventDefinitions.MSC.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'MSC_and_Rudder_Buildings'
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  }
];

export const GisDayConfiguration: EventConfiguration = {
  id: 'gis-day-msc',
  name: 'GIS Day @ MSC',
  applicationName: 'GIS Day Event Map',
  shortApplicationName: 'GIS Day',
  introductionText: 'Map of GIS Day events at the Memorial Student Center.',
  eventDates: ['2025-11-17', '2025-11-18','2025-11-19','2025-11-20','2025-11-21'],
  mapCenter: [-96.3417, 30.6122],
  zoom: 18
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
    description: 'Locations for Texas A&M GIS Day.',
    source: 'internal',
    type: 'event',
    keywords: ['gis', 'gis day', 'msc', 'tamu']
  }
};
