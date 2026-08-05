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
      columnKey: event.discover?.columnKey ?? event.discover?.parkingCategory,
      visible: event.discover?.visible ?? true,
      showInQuickLinks: event.discover?.showInQuickLinks,
      quickLinkOrder: event.discover?.quickLinkOrder,
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

    this.getVisibleInternalDiscoverApplications()
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

  public getQuickLinkApplications(): InternalDiscoverApplication[] {
    const quickLinks = this.getVisibleInternalDiscoverApplications()
      .map((app, index) => ({ app, index }))
      .filter(({ app }) => app.showInQuickLinks === true);

    const orderCounts = new Map<number, number>();
    for (const { app } of quickLinks) {
      const order = app.quickLinkOrder;
      if (typeof order === 'number' && Number.isFinite(order) && order >= 0) {
        orderCounts.set(order, (orderCounts.get(order) ?? 0) + 1);
      }
    }

    const seenOrders = new Map<number, number>();
    const resolved = quickLinks
      .map(({ app, index }) => ({
        app,
        index,
        order: this.resolveQuickLinkOrder(app, index, orderCounts, seenOrders)
      }))
      .sort((a, b) => {
        if (a.order.group !== b.order.group) {
          return a.order.group - b.order.group;
        }

        if (a.order.group === 0 && b.order.group === 0 && a.order.value !== b.order.value) {
          return a.order.value - b.order.value;
        }

        return a.index - b.index;
      });

    return resolved.map(({ app }) => app);
  }

  public getVisibleInternalDiscoverApplications(): InternalDiscoverApplication[] {
    return this.getInternalDiscoverApplications().filter((app) => app.visible !== false);
  }

  private resolveQuickLinkOrder(
    app: InternalDiscoverApplication,
    fallbackIndex: number,
    orderCounts: Map<number, number>,
    seenOrders: Map<number, number>
  ): { group: 0 | 1; value: number } {
    const order = app.quickLinkOrder;

    if (order === undefined) {
      return { group: 1, value: fallbackIndex };
    }

    if (!Number.isFinite(order) || order < 0) {
      console.warn(`Invalid quick link order '${order}' for '${app.id}'. Falling back to default order.`);
      return { group: 1, value: fallbackIndex };
    }

    const count = orderCounts.get(order) ?? 0;
    if (count > 1) {
      const seen = seenOrders.get(order) ?? 0;
      seenOrders.set(order, seen + 1);

      if (seen > 0) {
        console.warn(
          `Duplicate quick link order '${order}' for '${app.id}'. The first match keeps the explicit position; this entry falls back to the default order.`
        );
        return { group: 1, value: fallbackIndex };
      }
    }

    return { group: 0, value: order };
  }

  public getAllDiscoverApplications(): DiscoverApplication[] {
    return [...this.getInternalDiscoverApplications(), ...this.getExternalDiscoverApplications()];
  }
}
