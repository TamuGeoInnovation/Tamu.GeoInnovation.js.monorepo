import { NotificationProperties } from '@tamu-gisc/common/ngx/ui/notification';
import { LayerSource } from '@tamu-gisc/common/types';
import { SearchSource } from '@tamu-gisc/ui-kits/ngx/search';

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
