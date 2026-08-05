import { DiscoverMapType, EventConfiguration, ParkingCategory } from '@tamu-gisc/ts/events/ngx';

interface BaseDiscoverApplication {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  keywords?: string[];
  /**
   * Optional labels to display on the application card (e.g., "New", "Beta", etc.)
   *
   * These will generally be used as chips or badges and are intended to be used to supplement the `type` field.
   */
  labels?: string[];
}

export interface ExternalDiscoverApplication extends BaseDiscoverApplication {
  source: 'external';
  type: 'experiment';
  location: string;
}

export interface InternalDiscoverApplication extends BaseDiscoverApplication {
  source: 'internal';
  type: 'event' | 'parking' | 'operations';
  mapType: DiscoverMapType;
  parkingCategory?: ParkingCategory;
  showInQuickLinks?: boolean;
  configuration: EventConfiguration;
}

export type DiscoverApplication = ExternalDiscoverApplication | InternalDiscoverApplication;
