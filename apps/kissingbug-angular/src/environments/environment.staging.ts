import { LayerSource } from '@tamu-gisc/common/types';
export * from './secrets';

export const environment = {
  production: false
};

export const api_url = 'https://kissingbug-stage.geoservices.tamu.edu/api';
export const email_server_url = 'https://mailroom.gsvcs.lan/api/';

export const SearchSources = [];
export const LayerSources: LayerSource[] = [];
