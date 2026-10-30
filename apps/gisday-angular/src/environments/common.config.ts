import { NotificationProperties } from '@tamu-gisc/common/ngx/ui/notification';
import { LayerSource } from '@tamu-gisc/common/types';
import { SearchSource } from '@tamu-gisc/ui-kits/ngx/search';

export { metadata } from '@tamu-gisc/common/ngx/environment';

export const api_url = '___ANGULAR_API_URL___';

/**
 * Which GIS Day site this deployment is, a key of `GISDAY_SITES` in `@tamu-gisc/gisday/common` (#1835).
 * Left unset, as it is for txgisday.org, the placeholder stays and the site is txgisday.org.
 */
export const site = '___ANGULAR_SITE___';

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
    message: 'Each submission needs your location. The form shows how to allow it on your phone.',
    imgUrl: './assets/images/out-of-bounds.svg',
    imgAltText: 'Out of Bounds Icon'
  }
];

export const LayerSources: LayerSource[] = [];

export const SearchSources: SearchSource[] = [];
