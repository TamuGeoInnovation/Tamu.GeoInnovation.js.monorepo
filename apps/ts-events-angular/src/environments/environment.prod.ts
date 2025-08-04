import { factory } from '@tamu-gisc/aggiemap/ngx/common';

const sources = factory({
  environment: 'prod',
  layerSources: {
    exclude: ['BIKE_LOCATIONS']
  }
});

export const environment = {
  production: true
};

export * from './definitions';

export const { Definitions, Connections, SearchSources, ThreeDLayers, LayerSources } = sources;
