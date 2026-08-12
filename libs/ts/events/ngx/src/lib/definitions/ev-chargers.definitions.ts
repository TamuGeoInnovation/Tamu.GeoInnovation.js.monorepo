import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

export enum EV_CHARGERS_LAYERS {
  EV_CHARGERS = 'ev-chargers'
}

const bikeLayersUrl = Connections.bikeMapUrl;

export const EvChargersDefinitions = {
  EV_CHARGERS: {
    id: EV_CHARGERS_LAYERS.EV_CHARGERS,
    layerId: EV_CHARGERS_LAYERS.EV_CHARGERS,
    name: 'EV Charge Stations (Main + RELLIS)',
    url: `${bikeLayersUrl}/0`
  }
};

export const EvChargersColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: EvChargersDefinitions.EV_CHARGERS.id,
    title: EvChargersDefinitions.EV_CHARGERS.name,
    url: EvChargersDefinitions.EV_CHARGERS.url,
    visible: true,
    listMode: 'show',
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: '{attributes.EV_ID}',
      description:
        '<strong>Network</strong>: {attributes.EV_Network}\n' +
        '<strong>Charging Level</strong>: {attributes.Ch_Level}\n' +
        '<strong>Garage Level</strong>: {attributes.Garage_Lvl}\n' +
        '<strong>Notes</strong>: {attributes.EVCS_Notes}'
    },
    native: {
      outFields: ['*']
    }
  }
];

export const EvChargersConfiguration: EventConfiguration = {
  id: 'ev-chargers',
  name: 'EV Chargers',
  applicationName: 'EV Chargers Map',
  shortApplicationName: 'EV Chargers',
  introductionText: 'Locate EV charge stations across Main Campus and the RELLIS Campus.',
  mapCenter: [-96.34643, 30.61313],
  eventDates: [],
  zoom: 15
};

export const EvChargersOptions: SpecialEventOptions = [];

export const EvChargersTs: AggiemapCustomMapConfiguration = {
  configuration: EvChargersConfiguration,
  options: EvChargersOptions,
  sources: EvChargersColdLayerSources,
  references: EV_CHARGERS_LAYERS,
  type: 'general-map',
  discover: {
    id: EvChargersConfiguration.id,
    name: EvChargersConfiguration.name,
    description: 'EV charging locations for Main Campus and the RELLIS Campus.',
    source: 'internal',
    type: 'parking',
    parkingCategory: 'general',
    keywords: ['ev', 'ev chargers', 'electric vehicle', 'charging', 'sustainable transportation', 'rellis']
  }
};
