import { LayerSource } from '@tamu-gisc/common/types';
import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import { FOOTBALL_PARKING_LAYERS } from '../interfaces/football-parking.interface';
import { EventConfiguration, SpecialEventOptions } from '../interfaces/special-event.interface';

const eventUrl = 'https://gis.tamu.edu/arcgis/rest/services/TS/TSFootball/MapServer';

const FootballParkingEventDefinitions = {
  FP_ACCESSIBLE_PRESALE_LOTS: {
    id: FOOTBALL_PARKING_LAYERS.FP_ACCESSIBLE_PRESALE_LOTS,
    layerId: 1,
    name: 'ADA Accessible and Presale Lots',
    url: `${eventUrl}/1`
  },
  FP_POIS: {
    id: FOOTBALL_PARKING_LAYERS.FP_POIS,
    layerId: 2,
    name: 'Points of Interest',
    url: `${eventUrl}/2`
  },
  FP_PARKING_LOTS: {
    id: FOOTBALL_PARKING_LAYERS.FP_PARKING_LOTS,
    layerId: 5,
    name: 'Football Parking Lots',
    url: `${eventUrl}/5`
  },
  FP_STREET_GRASS_AREAS: {
    id: FOOTBALL_PARKING_LAYERS.FP_STREET_GRASS_AREAS,
    layerId: 6,
    name: 'Street/Grass Areas',
    url: `${eventUrl}/6`
  },
  FP_GAMEDAY_SHUTTLE: {
    id: FOOTBALL_PARKING_LAYERS.FP_GAMEDAY_SHUTTLE,
    layerId: 7,
    name: 'Game Day Shuttle',
    url: `${eventUrl}/7`
  }
};

export const FootballParkingColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: FootballParkingEventDefinitions.FP_ACCESSIBLE_PRESALE_LOTS.id,
    title: FootballParkingEventDefinitions.FP_ACCESSIBLE_PRESALE_LOTS.name,
    url: FootballParkingEventDefinitions.FP_ACCESSIBLE_PRESALE_LOTS.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.LotName',
      description: 'attributes.Description'
    },
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: FootballParkingEventDefinitions.FP_POIS.id,
    title: FootballParkingEventDefinitions.FP_POIS.name,
    url: FootballParkingEventDefinitions.FP_POIS.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.Notes',
      description: 'attributes.Notes_1'
    },
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: FootballParkingEventDefinitions.FP_PARKING_LOTS.id,
    title: FootballParkingEventDefinitions.FP_PARKING_LOTS.name,
    url: FootballParkingEventDefinitions.FP_PARKING_LOTS.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.LotName',
      description: 'attributes.Note'
    },
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: FootballParkingEventDefinitions.FP_STREET_GRASS_AREAS.id,
    title: FootballParkingEventDefinitions.FP_STREET_GRASS_AREAS.name,
    url: FootballParkingEventDefinitions.FP_STREET_GRASS_AREAS.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.AreaName',
      description: 'attributes.aNote'
    },
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: FootballParkingEventDefinitions.FP_GAMEDAY_SHUTTLE.id,
    title: FootballParkingEventDefinitions.FP_GAMEDAY_SHUTTLE.name,
    url: FootballParkingEventDefinitions.FP_GAMEDAY_SHUTTLE.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.RouteName',
      description: 'attributes.Description'
    },
    native: {
      outFields: ['*']
    }
  }
];

export const FootballParkingConfiguration: EventConfiguration = {
  id: 'football-parking',
  name: 'Football Parking',
  applicationName: 'Football Parking Map',
  shortApplicationName: 'Football Map',
  introductionText: 'Get the best transportation and parking information for football game days.',
  eventDates: [],
  mapCenter: [-96.34344, 30.61011],
  zoom: 16
};

export const FootballParkingOptions: SpecialEventOptions = [];
