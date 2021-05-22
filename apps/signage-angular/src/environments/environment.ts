import { SearchSource } from '@tamu-gisc/search';
import { LayerSource } from '@tamu-gisc/common/types';

import { Popups } from '@tamu-gisc/signage';

// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `workspace.json`.

export const environment = {
  production: false
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.

const commonLayerProps = {
  outFields: ['*'],
  minScale: 100000,
  maxScale: 0,
  elevationInfo: { mode: 'relative-to-ground', offset: 1 },
  popupEnabled: false
};

export const SearchSources: SearchSource[] = [];

export const LayerSources: LayerSource[] = [
  {
    id: 'signage-layer',
    type: 'geojson',
    url: 'https://gisday.tamu.edu/Rest/Signage/Get/Submissions/?geoJSON=true',
    listMode: 'show',
    title: 'Signage Points',
    loadOnInit: true,
    popupComponent: Popups.SignPopupComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'graphics',
    id: 'drawing-layer',
    title: 'Custom Boundary',
    listMode: 'show',
    loadOnInit: true,
    visible: true,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'graphics',
    id: 'selection-layer',
    title: 'Selected Buildings',
    listMode: 'hide',
    loadOnInit: false,
    visible: true,
    native: {
      ...commonLayerProps
    }
  }
];
