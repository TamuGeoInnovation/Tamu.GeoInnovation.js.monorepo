import { LayerSource } from '@tamu-gisc/common/types';
export * from './secrets';

export const environment = {
  production: false
};

export const api_url = 'https://dev.kissingbug.geoservices.tamu.edu/api';
export const email_server_url = 'http://mailroom.dev.gsvcs.lan/api/';

export const SearchSources = [];
export const LayerSources: LayerSource[] = [];
