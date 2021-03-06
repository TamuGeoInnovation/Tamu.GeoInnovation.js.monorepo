import { LayerSource } from '@tamu-gisc/common/types';

const commonLayerProps = {
  minScale: 10000000,
  maxScale: 0
};

export const SearchSources = [];

export const LayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: 'county-boundary',
    title: 'County',
    url: 'https://texasatlas.arch.tamu.edu/arcgis/rest/services/PubTX/TA_AdminBdys/MapServer/7',
    native: {
      ...commonLayerProps,
      definitionExpression: 'GEOID = 48489',
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-line',
          color: 'red',
          style: 'short-dash',
          join: 'round',
          cap: 'round',
          width: '2pt'
        }
      }
    }
  },
  {
    type: 'graphics',
    id: 'drawing-layer',
    title: 'Drawn Features',
    native: {
      ...commonLayerProps
    }
  }
];

export const NotificationEvents = [];
