import { LayerSource } from '@tamu-gisc/common/types';

import { MarkdownWDirectionsPopupComponent } from '../modules/popups/markdown-w-directions-popup/markdown-w-directions-popup.component';
import { EventConfiguration, SpecialEventOptions } from '../interfaces/special-event.interface';
import { FAMILY_WEEKEND_LAYERS } from '../interfaces/family-weekend.interface';

const eventUrl = 'https://gis.tamu.edu/arcgis/rest/services/TS/Family_Weekend/MapServer';

export const FamilyWeekendDefinitions = {
  PARKING_LOTS: {
    id: FAMILY_WEEKEND_LAYERS.PARKING_LOTS,
    layerId: FAMILY_WEEKEND_LAYERS.PARKING_LOTS,
    name: 'Family Weekend Parking Lots',
    url: `${eventUrl}/0`
  }
};

export const FamilyWeekendColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: FamilyWeekendDefinitions.PARKING_LOTS.id,
    title: FamilyWeekendDefinitions.PARKING_LOTS.name,
    url: FamilyWeekendDefinitions.PARKING_LOTS.url,
    popupComponent: MarkdownWDirectionsPopupComponent,
    popupData: {
      name: 'attributes.Type',
      description: 'attributes.description'
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  }
];

export const FamilyWeekendConfiguration: EventConfiguration = {
  id: 'family-weekend-2025',
  name: 'Family Weekend',
  applicationName: 'Family Weekend Transportation Map',
  shortApplicationName: 'Family Weekend Map',
  eventDates: ['2025-04-04', '2025-04-05', '2025-04-06'],
  mapCenter: [-96.3405, 30.61114],
  zoom: 16
};

export const FamilyWeekendOptions: SpecialEventOptions = [];
