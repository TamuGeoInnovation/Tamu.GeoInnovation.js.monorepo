import { SearchSource } from '@tamu-gisc/search';
import { LayerSource } from '@tamu-gisc/common/types';

import { Popups } from '@tamu-gisc/signage';

export const environment = {
  production: true
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
    popupComponent: Popups.SignComponent
  },
  {
    type: 'graphic',
    id: 'drawing-layer',
    title: 'Custom Boundary',
    listMode: 'show',
    loadOnInit: true,
    visible: true
  }
];
