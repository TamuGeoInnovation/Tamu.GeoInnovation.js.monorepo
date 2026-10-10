import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { Params, Router, RouterLink } from '@angular/router';
import { FormControl } from '@angular/forms';
import { combineLatest, Observable } from 'rxjs';
import { debounceTime, map, shareReplay, startWith } from 'rxjs/operators';

import { TestingService } from '@tamu-gisc/dev-tools/application-testing';
import { nextEventDate } from '@tamu-gisc/common/utils/date';

import {
  DiscoverApplication,
  ExternalDiscoverApplication,
  InternalDiscoverApplication
} from '../../interfaces/discover-application.interface';
import { DiscoveryService, FEATURED_PARKING_ID } from '../../services/discovery/discovery.service';
import { LastMapService } from '../../services/last-map/last-map.service';
import { getApplicationRoute, getNextEventDate } from '../discover.utils';
import { QuickLinkItem, QuickLinksComponent } from '../quick-links/quick-links.component';
import { AutocompleteComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { AutocompleteOptionTemplateDirective } from '@tamu-gisc/ui-kits/ngx/forms';
import { CopyComponent } from '@tamu-gisc/ui-kits/ngx/interactions/clipboard';

import { AsyncPipe, UpperCasePipe } from '@angular/common';
import { FooterComponent } from '@tamu-gisc/aggiemap/ngx/ui/shared';

/**
 * "All Maps" landing page. Surfaces the Visit Maps quick links, a map search, and the top upcoming
 * events. The dev-only "All Events" and "Experimental Applications" sections are preserved here.
 */
@Component({
  selector: 'tamu-gisc-aggiemap-all-maps',
  templateUrl: './all-maps.component.html',
  styleUrls: ['./all-maps.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    RouterLink,
    AutocompleteComponent,
    AutocompleteOptionTemplateDirective,
    QuickLinksComponent,
    CopyComponent,
    FooterComponent,
    AsyncPipe,
    UpperCasePipe
  ]
})
export class AllMapsComponent implements OnInit {
  private readonly rt = inject(Router);
  private readonly discoveryService = inject(DiscoveryService);
  private readonly dev = inject(TestingService);
  private readonly lastMap = inject(LastMapService);

  public readonly mainParkingRoute = ['/parking', FEATURED_PARKING_ID];

  public externalApplications: ExternalDiscoverApplication[];
  private internalApplications: InternalDiscoverApplication[];
  private allApplications: DiscoverApplication[];

  /**
   * The development-only All Events list keeps every event, retired ones included: it is where the
   * team finds a map that no longer works (#1098). Every other list leaves retired maps out.
   */
  private allEventApplications: InternalDiscoverApplication[];

  /**
   * Dev-only listing of "kiosk" (sidebar-free, preset-layer) maps, surfaced here with their full,
   * shareable URLs so the team embedding them (e.g. in a mobile app webview) can copy them. Never
   * shown in prod and never searchable, even in dev — see `DiscoveryService.getKioskDiscoverApplications`.
   */
  public kioskApplications: Array<InternalDiscoverApplication & { url: string }> = [];

  /**
   * The satellite-campus maps (Galveston, McAllen, DC Bush School), listed on every environment
   * since #1482.
   *
   * They remain filtered out of the map search in both environments, on purpose: that search is
   * College Station's, and a Galveston building answering a search made there would be a worse
   * result than no result. This section and the Visit Maps tile are the only entry points, which is
   * why each card carries a copy field.
   */
  public campusApplications: Array<InternalDiscoverApplication & { url: string }> = [];

  public upcomingApplications: InternalDiscoverApplication[] = [];
  public quickLinks: QuickLinkItem[] = [];

  public searchControl = new FormControl();
  public filteredApplications: Observable<DiscoverApplication[]>;
  public isDev: Observable<boolean>;

  public readonly getApplicationRoute = getApplicationRoute;
  public readonly getNextEventDate = getNextEventDate;

  /**
   * Where the breadcrumb's first crumb points: the map the visitor was last looking at, rather than
   * always the main campus map. Someone who opened this page from an event map expects to be
   * returned there. See LastMapService.
   *
   * Path only. The query and fragment are bound separately below, because `[routerLink]` encodes a
   * `?` into the path when given a whole URL as a string.
   */
  public get lastMapPath(): string {
    return this.lastMap.path;
  }

  public get lastMapQueryParams(): Params {
    return this.lastMap.queryParams;
  }

  public get lastMapFragment(): string | undefined {
    return this.lastMap.fragment;
  }

  public ngOnInit(): void {
    this.isDev = this.dev.get('isTesting');
    this.internalApplications = this.discoveryService.getInternalDiscoverApplications();
    this.allEventApplications = this.discoveryService.getInternalDiscoverApplications({ includeRetired: true });
    this.externalApplications = this.discoveryService.getExternalDiscoverApplications();
    // Satellite-campus maps have their own dedicated "Campus Maps" listing page and are deliberately
    // left out of the general map search, on production as well as development (#1482): that search
    // is College Station's.
    this.allApplications = this.discoveryService
      .getAllDiscoverApplications()
      .filter((app) => !(app.source === 'internal' && app.type === 'satellite-campus'));
    this.kioskApplications = this.discoveryService.getKioskDiscoverApplications().map((app) => ({
      ...app,
      url: `${window.location.origin}${getApplicationRoute(app).join('/')}`
    }));
    // Sourced from the internal list rather than a dedicated service method: unlike kiosk maps,
    // satellite-campus maps are ordinary discover applications and are only excluded from search.
    this.campusApplications = this.internalApplications
      .filter((app) => app.type === 'satellite-campus')
      .map((app) => ({ ...app, url: `${window.location.origin}${getApplicationRoute(app).join('/')}` }));
    this.quickLinks = this.discoveryService.getQuickLinkApplications().map((app) => ({
      label: app.name,
      routerLink: getApplicationRoute(app)
    }));

    this.filteredApplications = combineLatest([this.searchControl.valueChanges.pipe(startWith('')), this.isDev]).pipe(
      debounceTime(100),
      map(([value, isDev]) => this._filterApplications(value || '', isDev)),
      shareReplay(1)
    );

    this.upcomingApplications = this.getUpcomingApplications();
  }

  public get allEvents(): InternalDiscoverApplication[] {
    return this.allEventApplications
      .filter((app) => app.mapTypes.includes('campus') || app.mapTypes.includes('athletics'))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  public onApplicationSelect(app: DiscoverApplication | undefined): void {
    if (!app) return;

    if (app.source === 'external') {
      window.open((app as ExternalDiscoverApplication).location, '_blank');
    } else if (app.source === 'internal') {
      this.rt.navigate(getApplicationRoute(app as InternalDiscoverApplication));
    }
  }

  private getUpcomingApplications(): InternalDiscoverApplication[] {
    const now = Date.now();

    return (
      this.discoveryService
        .getVisibleInternalDiscoverApplications()
        // Each event's next date, counting today's: an event is on for its whole day (#1301).
        .map((app) => ({ app, next: nextEventDate(app.configuration.eventDates, now) }))
        .filter((upcoming): upcoming is { app: InternalDiscoverApplication; next: number } => upcoming.next !== null)
        .sort((a, b) => a.next - b.next || a.app.name.localeCompare(b.app.name))
        .slice(0, 3)
        .map(({ app }) => app)
    );
  }

  private _filterApplications(value: string, isDev: boolean): DiscoverApplication[] {
    const filtered = isDev
      ? this.allApplications
      : this.allApplications.filter((app) => app.source === 'external' || app.visible !== false);

    if (!value) {
      return filtered.slice(0, 10);
    }

    const filterValue = value.toLowerCase();

    return filtered.filter((app) => {
      const nameMatch = app.name.toLowerCase().includes(filterValue);
      const idMatch = app.id.toLowerCase().includes(filterValue);
      const keywordsMatch = app.keywords
        ? app.keywords.some((keyword) => keyword.toLowerCase().includes(filterValue))
        : false;
      return nameMatch || idMatch || keywordsMatch;
    });
  }
}
