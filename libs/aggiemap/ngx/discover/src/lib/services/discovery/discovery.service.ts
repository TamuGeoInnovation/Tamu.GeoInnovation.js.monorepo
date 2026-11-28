import { Injectable } from '@angular/core';

import { EventDefinitions } from '@tamu-gisc/ts/events/ngx';

import {
  DiscoverApplication,
  ExternalDiscoverApplication,
  InternalDiscoverApplication
} from '../../interfaces/discover-application.interface';
import { ExternalDiscoverApplications } from '../../definitions/external-discover-applications';
import { MainMapDiscoverApplications } from '../../definitions/main-map-discover-applications';

/**
 * Id of the featured "Campus Main Parking" map. It is surfaced as a dedicated button across the
 * map pages and therefore excluded from the grouped parking columns.
 */
export const FEATURED_PARKING_ID = 'ts-main-parking';

/**
 * Whether a listing shows this map, given whether development-only features are on (#3470).
 *
 * A `developmentOnly` map (#2712) is listed only where those features are on. A map with `visible: false` is listed
 * nowhere, on any environment (#1704): it meant "not in production's listings", so development offered the undated Move
 * Out beside its three dated periods and stopped showing what production would. A development-only map used to arrive
 * here as `visible: false` too, which is why the two are now separate fields. This was written four ways across three pages, and the fourth was a bug: the Parking &
 * Transportation page took the visible-filtered list, which hides a development-only map on development too. That is
 * exactly what #2449 fixed on the category pages, and it was latent here only because no development-only parking map
 * exists yet.
 *
 * `isTesting` comes from `TestingService.isTesting`, so `?as=production` hides these maps as it does everywhere else.
 * Deliberately not `readsDevelopmentGisServer()`, which answers a different question - which GIS server to read, with
 * localhost counting as production - and would hide them from anyone running the application locally.
 */
export function isListed(application: { visible?: boolean; developmentOnly?: boolean }, isTesting: boolean): boolean {
  return application.visible !== false && (isTesting || !application.developmentOnly);
}

@Injectable({
  providedIn: 'root'
})
export class DiscoveryService {
  /**
   * Every listable map. Kiosk maps have their own listing.
   *
   * Retired maps are left out unless `includeRetired` is set: their events are over, so search and
   * the listing pages do not offer them on any environment (#1098). The development-only All Events
   * list is the one exception, because it is where the team keeps every event, working or not.
   */
  public getInternalDiscoverApplications(options: { includeRetired?: boolean } = {}): InternalDiscoverApplication[] {
    const definitions: InternalDiscoverApplication[] = EventDefinitions.filter(
      (event): event is typeof event & { configuration: NonNullable<typeof event.configuration> } =>
        event.configuration !== null &&
        event.discover?.type !== 'kiosk' &&
        (options.includeRetired === true || event.discover?.status !== 'retired')
    ).map((event) => ({
      id: event.discover?.id || event.configuration.id,
      source: 'internal' as const,
      type: event.discover?.type || 'event',
      // A map can be listed on more than one detail page. `mapTypes` wins when set; otherwise the
      // single `mapType` is used, and failing that the type decides. Campus is the fallback, which
      // is why maps that declare nothing land on Campus Events.
      mapTypes: event.discover?.mapTypes ?? [
        event.discover?.mapType ||
          (event.discover?.type === 'parking' ? 'parking' : event.discover?.type === 'operations' ? 'operations' : 'campus')
      ],
      parkingCategory: event.discover?.parkingCategory,
      columnKey: event.discover?.columnKey ?? event.discover?.parkingCategory,
      visible: event.discover?.visible ?? true,
      // Listed where development-only features are on, and nowhere else (#2712, #1704).
      developmentOnly: Boolean(event.developmentOnly),
      showInQuickLinks: event.discover?.showInQuickLinks,
      quickLinkOrder: event.discover?.quickLinkOrder,
      status: event.discover?.status,
      name: event.discover?.name || event.configuration.name,
      description: event.discover?.description || event.configuration.introductionText || '',
      // Carried through so a listing can show the map rather than a blank area. Omitting it here
      // is invisible: the field is optional, so the template still typechecks and simply renders
      // nothing (#1275).
      thumbnail: event.discover?.thumbnail,
      configuration: event.configuration,
      keywords: event.discover?.keywords || [],
      labels: event.discover?.labels || []
    }));

    // Then the main map's own panels that are listed as maps, such as the bus map (#2743).
    return [...definitions, ...MainMapDiscoverApplications];
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

  /** Every map a listing shows, given whether development-only features are on. The one rule (#3470). */
  public listedApplications(isTesting: boolean): InternalDiscoverApplication[] {
    return this.getInternalDiscoverApplications().filter((app) => isListed(app, isTesting));
  }

  /**
   * Every map a listing shows on production. The same rule with `isTesting` false, kept because quick links and the
   * upcoming-events strip ask for exactly that on every environment; a listing of a *page* wants
   * `listedApplications(isTesting)` instead.
   */
  public getVisibleInternalDiscoverApplications(): InternalDiscoverApplication[] {
    return this.listedApplications(false);
  }

  /**
   * Development-only listing of "kiosk" maps (sidebar-free, preset-layer maps meant to be embedded
   * elsewhere, e.g. in a mobile app webview). These are intentionally excluded from
   * `getInternalDiscoverApplications()` and therefore never appear in search, "All Events", parking
   * columns, or quick links - this is the only place they are surfaced, so their URLs can be shared
   * with the team embedding them.
   */
  public getKioskDiscoverApplications(): InternalDiscoverApplication[] {
    return EventDefinitions.filter(
      (event): event is typeof event & { configuration: NonNullable<typeof event.configuration> } =>
        event.configuration !== null && event.discover?.type === 'kiosk'
    ).map((event) => ({
      id: event.discover?.id || event.configuration.id,
      source: 'internal' as const,
      type: 'kiosk' as const,
      mapTypes: ['kiosk' as const],
      parkingCategory: event.discover?.parkingCategory,
      columnKey: event.discover?.columnKey,
      visible: event.discover?.visible ?? true,
      showInQuickLinks: false,
      quickLinkOrder: undefined,
      name: event.discover?.name || event.configuration.name,
      description: event.discover?.description || event.configuration.introductionText || '',
      // Carried through so a listing can show the map rather than a blank area. Omitting it here
      // is invisible: the field is optional, so the template still typechecks and simply renders
      // nothing (#1275).
      thumbnail: event.discover?.thumbnail,
      configuration: event.configuration,
      keywords: event.discover?.keywords || [],
      labels: event.discover?.labels || []
    }));
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
