import { LayerSource } from '@tamu-gisc/common/types';

export const SearchSources = [];
export const LayerSources: LayerSource[] = [
  {
    id: 'census-tracts',
    url: 'https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Census_Tracts/FeatureServer',
    type: 'feature',
    title: 'Census Tracts',
    visible: false,
    native: {
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-fill',
          style: 'solid',
          color: null,
          outline: { color: 'green', width: 1.25 }
        }
      },
      labelingInfo: [
        {
          labelPlacement: 'center-center',
          labelExpressionInfo: { expression: '"Tract: " + $feature.TRACT_FIPS' },
          symbol: {
            type: 'text',
            color: [0, 0, 0, 255],
            haloColor: [255, 255, 255, 255],
            haloSize: 1,
            font: {
              size: 10,
              weight: 'bold'
            }
          }
        }
      ]
    }
  },
  {
    id: 'census-block-groups',
    url: 'https://services2.arcgis.com/FiaPA4ga0iQKduv3/arcgis/rest/services/USA_Block_Groups_v1/FeatureServer',
    type: 'feature',
    title: 'Census Block Groups',
    visible: false,
    native: {
      renderer: {
        visualVariables: [
          {
            type: 'size',
            target: 'outline',
            expression: 'view.scale',
            valueExpression: '$view.scale',
            stops: [
              { size: 1.5, value: 119269 },
              { size: 0.75, value: 372714 },
              { size: 0.375, value: 1490857 },
              { size: 0, value: 2981714 }
            ]
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ] as any,
        type: 'simple',
        symbol: {
          color: null,
          outline: { color: 'red', width: 1.25 },
          type: 'simple-fill',
          style: 'solid'
        }
      },
      labelingInfo: [
        {
          labelPlacement: 'center-center',
          labelExpressionInfo: { expression: '"Group:" + $feature.BLKGRP' },
          symbol: {
            type: 'text',
            color: [0, 0, 0, 255],
            haloColor: [255, 255, 255, 255],
            haloSize: 1,
            font: {
              size: 10,
              weight: 'bold'
            }
          }
        }
      ]
    }
  },
  {
    id: 'census-blocks',
    url: 'https://services2.arcgis.com/FiaPA4ga0iQKduv3/arcgis/rest/services/US_Census_Blocks_v1/FeatureServer',
    type: 'feature',
    title: 'Census Blocks',
    visible: false,
    native: {
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-fill',
          style: 'solid',
          color: [252, 217, 199, 0.05],
          outline: { color: 'blue', width: 1.25 }
        }
      },
      labelingInfo: [
        {
          labelPlacement: 'center-center',
          labelExpressionInfo: { expression: '"Block: " + $feature.BLOCK' },
          symbol: {
            type: 'text',
            color: [0, 0, 0, 255],
            haloColor: [255, 255, 255, 255],
            haloSize: 1,
            font: {
              size: 10,
              weight: 'bold'
            }
          }
        }
      ]
    }
  }
];
export const NotificationEvents = [];
