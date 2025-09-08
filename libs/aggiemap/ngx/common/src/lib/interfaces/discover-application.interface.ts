import { EventConfiguration } from '@tamu-gisc/ts/events/ngx';

interface BaseDiscoverApplication {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  keywords?: string[];
}

export interface ExternalDiscoverApplication extends BaseDiscoverApplication {
  source: 'external';
  type: 'experiment';
  location: string;
}

export interface InternalDiscoverApplication extends BaseDiscoverApplication {
  source: 'internal';
  type: 'event';
  configuration: EventConfiguration;
}

export type DiscoverApplication = ExternalDiscoverApplication | InternalDiscoverApplication;
