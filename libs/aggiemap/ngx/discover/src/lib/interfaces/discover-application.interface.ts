import { DiscoverMapType, EventConfiguration, ParkingCategory } from '@tamu-gisc/ts/events/ngx';

interface BaseDiscoverApplication {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  keywords?: string[];
  visible?: boolean;
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
  type: 'event' | 'parking' | 'operations' | 'satellite-campus' | 'kiosk';
  /**
   * Every detail page this map is listed on. Always at least one entry, so consumers can test
   * membership with `includes` and never have to handle a missing value.
   */
  mapTypes: DiscoverMapType[];
  parkingCategory?: ParkingCategory;
  columnKey?: string;
  showInQuickLinks?: boolean;
  quickLinkOrder?: number;
  configuration: EventConfiguration;
}

export type DiscoverApplication = ExternalDiscoverApplication | InternalDiscoverApplication;
