import { LayerSource } from '@tamu-gisc/common/types';

import { PHYSICS_AND_ENGINEERING_FESTIVAL_LAYERS } from '../interfaces/physics-engineering-festival.interface';
import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import { MarkdownWDirectionsPopupComponent } from '../modules/popups/markdown-w-directions-popup/markdown-w-directions-popup.component';
import { EventConfiguration, SpecialEventOptions } from '../interfaces/special-event.interface';

const eventUrl = 'https://gis.tamu.edu/arcgis/rest/services/TS/Physics_Fest/MapServer';

export const PhysEngFestDefinitions = {
  FESTIVAL_AREAS: {
    id: PHYSICS_AND_ENGINEERING_FESTIVAL_LAYERS.FESTIVAL_AREAS,
    layerId: PHYSICS_AND_ENGINEERING_FESTIVAL_LAYERS.FESTIVAL_AREAS,
    name: 'Physics & Engineering Festival Areas',
    url: `${eventUrl}/0`
  },
  PEDESTRIAN_PATHS: {
    id: PHYSICS_AND_ENGINEERING_FESTIVAL_LAYERS.PEDESTRIAN_PATH,
    layerId: PHYSICS_AND_ENGINEERING_FESTIVAL_LAYERS.PEDESTRIAN_PATH,
    name: 'Pedestrian Path',
    url: `${eventUrl}/1`
  }
};

export const PhysEngFestivalColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: PhysEngFestDefinitions.FESTIVAL_AREAS.id,
    title: PhysEngFestDefinitions.FESTIVAL_AREAS.name,
    url: PhysEngFestDefinitions.FESTIVAL_AREAS.url,
    popupComponent: MarkdownWDirectionsPopupComponent,
    visible: true,
    listMode: 'show',
    popupData: {
      name: 'attributes.Type',
      description: 'attributes.name'
    },
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: PhysEngFestDefinitions.PEDESTRIAN_PATHS.id,
    title: PhysEngFestDefinitions.PEDESTRIAN_PATHS.name,
    url: PhysEngFestDefinitions.PEDESTRIAN_PATHS.url,
    popupComponent: MarkdownPopupComponent,
    visible: true,
    native: {
      listMode: 'show',
      outFields: ['*'],
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-line',
          color: 'rgb(56, 168, 0)',
          width: 2.5,
          marker: {
            style: 'arrow',
            color: 'rgb(56, 168, 0)',
            placement: 'end'
          }
        }
      }
    }
  }
];

export const PhysicsAndEngineeringFestivalConfiguration: EventConfiguration = {
  id: 'phys-eng-fest',
  name: 'Physics and Engineering Festival',
  applicationName: 'Physics and Engineering Festival Transportation Map',
  shortApplicationName: 'Physics and Engineering Festival Map',
  introductionText: 'Get the best parking information for the',
  eventDates: ['2025-04-05'],
  mapCenter: [-96.33771, 30.62143],
  zoom: 17
};

export const PhysicsAndEngineeringFestivalOptions: SpecialEventOptions = [];
