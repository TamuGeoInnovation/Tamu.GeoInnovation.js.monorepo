import { NotificationProperties } from '@tamu-gisc/common/ngx/ui/notification';
import { LayerSource } from '@tamu-gisc/common/types';
import { SearchSource } from '@tamu-gisc/ui-kits/ngx/search';

export { metadata } from '@tamu-gisc/common/ngx/environment';

export const api_url = 'http://localhost:3333';

export const auth0 = {
  domain: 'geoservices-dev.us.auth0.com',
  client_id: 'Ge5KZRlXSGuzjI4Eo8odMgoFOoTAYqn1',
  redirect_uri: window.location.origin + '/callback',
  audience: 'gisday.dev.api',
  roles_claim: 'geoservices.dev/roles',
  urls: ['http://localhost']
};

export const NotificationEvents: NotificationProperties[] = [
  {
    id: 'no_gps',
    title: 'Location Services Disabled',
    acknowledge: false,
    message: 'Location permissions are required for this application. Please enable them in your settings.',
    imgUrl: './assets/images/out-of-bounds.svg',
    imgAltText: 'Out of Bounds Icon'
  }
];

export const LayerSources: LayerSource[] = [];

export const SearchSources: SearchSource[] = [];
