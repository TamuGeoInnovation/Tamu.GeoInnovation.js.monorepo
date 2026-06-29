import { Injectable } from '@angular/core';

import { EventDefinitions, ParkingCategory } from '@tamu-gisc/ts/events/ngx';

import {
  DiscoverApplication,
  ExternalDiscoverApplication,
  InternalDiscoverApplication
} from '../../interfaces/discover-application.interface';
import { ExternalDiscoverApplications } from '../../definitions/external-discover-applications';

/**
 * Id of the featured "Campus Main Parking" map. It is surfaced as a dedicated button across the
 * map pages and therefore excluded from the grouped parking columns.
 */
export const FEATURED_PARKING_ID = 'ts-main-parking';

@Injectable({
  providedIn: 'root'
})
export class DiscoveryService {
  public getInternalDiscoverApplications(): InternalDiscoverApplication[] {
    return EventDefinitions.filter(
      (event): event is typeof event & { configuration: NonNullable<typeof event.configuration> } =>
        event.configuration !== null
    ).map((event) => ({
      id: event.discover?.id || event.configuration.id,
      source: 'internal' as const,
      type: event.discover?.type || 'event',
      mapType: event.discover?.mapType || (event.discover?.type === 'parking' ? 'parking' : event.discover?.type === 'operations' ? 'operations' : 'campus'),
      parkingCategory: event.discover?.parkingCategory,
      name: event.discover?.name || event.configuration.name,
      description: event.discover?.description || event.configuration.introductionText || '',
      configuration: event.configuration,
      keywords: event.discover?.keywords || [],
      labels: event.discover?.labels || []
    }));
  }

  /**
   * Returns parking maps grouped into the named columns used by the Parking Maps page. Maps without
   * an explicit `parkingCategory` fall back to the `general` column so nothing is dropped. Each
   * column is sorted alphabetically by name.
   */
  public getParkingApplicationsByCategory(): Record<ParkingCategory, InternalDiscoverApplication[]> {
    const groups: Record<ParkingCategory, InternalDiscoverApplication[]> = {
      general: [],
      business: [],
      permit: []
    };

    this.getInternalDiscoverApplications()
      .filter((app) => app.mapType === 'parking' && app.id !== FEATURED_PARKING_ID)
      .forEach((app) => {
        groups[app.parkingCategory ?? 'general'].push(app);
      });

    (Object.keys(groups) as ParkingCategory[]).forEach((key) => {
      groups[key].sort((a, b) => a.name.localeCompare(b.name));
    });

    return groups;
  }

  public getExternalDiscoverApplications(): ExternalDiscoverApplication[] {
    return ExternalDiscoverApplications;
  }

  public getAllDiscoverApplications(): DiscoverApplication[] {
    return [...this.getInternalDiscoverApplications(), ...this.getExternalDiscoverApplications()];
  }
}
