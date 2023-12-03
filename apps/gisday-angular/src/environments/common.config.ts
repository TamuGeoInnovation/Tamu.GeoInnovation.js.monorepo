import { NotificationProperties } from '@tamu-gisc/common/ngx/ui/notification';
import { LayerSource } from '@tamu-gisc/common/types';
import { SearchSource } from '@tamu-gisc/ui-kits/ngx/search';

export const api_url = '___ANGULAR_API_URL___';

export const auth0 = {
  domain: '___ANGULAR_AUTH0_DOMAIN___',
  client_id: '___ANGULAR_AUTH0_CLIENT_ID___',
  redirect_uri: window.location.origin + '/callback',
  audience: '___ANGULAR_AUTH0_AUDIENCE___',
  roles_claim: '___ANGULAR_AUTH0_ROLES_CLAIM___',
  urls: ['___ANGULAR_AUTH0_URLS___']
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
