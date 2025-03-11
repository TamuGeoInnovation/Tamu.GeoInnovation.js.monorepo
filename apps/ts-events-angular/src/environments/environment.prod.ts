import { factory } from '@tamu-gisc/aggiemap/ngx/common';

const sources = factory({ environment: 'prod' });

export const environment = {
  production: true
};

export * from './definitions';

export const { Definitions, Connections, LegendSources, SearchSources, ThreeDLayers, LayerSources } = sources;
