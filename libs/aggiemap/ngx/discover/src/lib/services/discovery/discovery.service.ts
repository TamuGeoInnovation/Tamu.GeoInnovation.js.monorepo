import { Injectable } from '@angular/core';

import { EventDefinitions } from '@tamu-gisc/ts/events/ngx';

import {
  DiscoverApplication,
  ExternalDiscoverApplication,
  InternalDiscoverApplication
} from '../../interfaces/discover-application.interface';
import { ExternalDiscoverApplications } from '../../definitions/external-discover-applications';

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
      mapType: event.discover?.mapType || (event.discover?.type === 'parking' ? 'parking' : 'campus'),
      name: event.discover?.name || event.configuration.name,
      description: event.discover?.description || event.configuration.introductionText || '',
      configuration: event.configuration,
      keywords: event.discover?.keywords || [],
      labels: event.discover?.labels || []
    }));
  }

  public getExternalDiscoverApplications(): ExternalDiscoverApplication[] {
    return ExternalDiscoverApplications;
  }

  public getAllDiscoverApplications(): DiscoverApplication[] {
    return [...this.getInternalDiscoverApplications(), ...this.getExternalDiscoverApplications()];
  }
}
