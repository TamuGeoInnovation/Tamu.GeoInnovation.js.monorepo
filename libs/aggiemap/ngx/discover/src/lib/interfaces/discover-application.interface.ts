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
  /**
   * `main-map` is the main campus map opened on one of its own panels (`route`), rather than a map of its own: the bus
   * map is `/map/d/bus` (#2743). It has no definition, so it has no `configuration`.
   */
  type: 'event' | 'parking' | 'operations' | 'satellite-campus' | 'kiosk' | 'main-map';
  /**
   * Where the entry opens, when that is not the `/<type>/<id>` its type gives: a panel of the main map. Taken as is by
   * `getApplicationRoute`.
   */
  route?: string[];
  /**
   * Every detail page this map is listed on. Always at least one entry, so consumers can test
   * membership with `includes` and never have to handle a missing value.
   */
  mapTypes: DiscoverMapType[];
  parkingCategory?: ParkingCategory;
  columnKey?: string;
  showInQuickLinks?: boolean;
  quickLinkOrder?: number;
  /**
   * `retired` for an event that is over (#1098). Only lists built with `includeRetired` contain
   * one, and they label it.
   */
  status?: 'retired';
  /** The map's definition. Absent for a `main-map` entry, which opens the main map and has no dates of its own. */
  configuration?: EventConfiguration;
}

export type DiscoverApplication = ExternalDiscoverApplication | InternalDiscoverApplication;
