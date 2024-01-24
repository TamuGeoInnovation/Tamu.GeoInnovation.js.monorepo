import { LayerSource } from '@tamu-gisc/common/types';

export const SearchSources = [];
export const LayerSources: LayerSource[] = [
  {
    id: 'census-tracts',
    url: 'https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Census_Tracts/FeatureServer',
    type: 'feature',
    title: 'Census Tracts',
    visible: false
  },
  {
    id: 'census-tracts',
    url: 'https://services2.arcgis.com/FiaPA4ga0iQKduv3/arcgis/rest/services/USA_Block_Groups_v1/FeatureServer',
    type: 'feature',
    title: 'Census Block Groups',
    visible: false
  },
  {
    id: 'census-tracts',
    url: 'https://services2.arcgis.com/FiaPA4ga0iQKduv3/arcgis/rest/services/US_Census_Blocks_v1/FeatureServer',
    type: 'feature',
    title: 'Census Blocks',
    visible: false
  }
];
export const NotificationEvents = [];
