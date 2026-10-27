import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { DiscoverMapType } from '@tamu-gisc/ts/events/ngx';

import { InternalDiscoverApplication } from '../../interfaces/discover-application.interface';
import { DiscoveryService } from '../../services/discovery/discovery.service';
import { TestingService } from '@tamu-gisc/dev-tools/application-testing';
import {
  buildMapColumnGroups,
  getApplicationRoute,
  sortApplicationsByName,
  MapColumnDefinition,
  MapColumnGroup
} from '../discover.utils';
import { QuickLinkItem, QuickLinksComponent } from '../quick-links/quick-links.component';
import { MapsPageHeaderComponent } from '../maps-page-header/maps-page-header.component';
import { MapColumnsComponent } from '../map-columns/map-columns.component';

import { FooterComponent } from '@tamu-gisc/aggiemap/ngx/ui/shared';

interface EventMapsRouteData {
  mapType: Extract<DiscoverMapType, 'campus' | 'athletics' | 'operations' | 'satellite-campus' | '150'>;
  title: string;
  intro?: string;
  columns?: Array<MapColumnDefinition>;
  /**
   * Whether the page shows the quick links. They are College Station's most-used maps, so a category
   * that is not about College Station, such as the satellite campuses, turns them off. Defaults to on.
   */
  quickLinks?: boolean;
  /** Whether the header shows the Main Campus Parking Map button, for the same reason. Defaults to on. */
  mainParking?: boolean;
}

/**
 * Shared page for the event map categories (Campus Events, Athletics Events, Campus Maps). The
 * category is supplied via the route `data` so a single component serves all of these routes.
 */
@Component({
  selector: 'tamu-gisc-aggiemap-event-maps',
  templateUrl: './event-maps.component.html',
  styleUrls: ['./event-maps.component.scss'],
  imports: [MapsPageHeaderComponent, MapColumnsComponent, QuickLinksComponent, FooterComponent]
})
export class EventMapsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly discoveryService = inject(DiscoveryService);
  private readonly testing = inject(TestingService);

  public title: string;
  public intro?: string;

  public applications: InternalDiscoverApplication[] = [];
  public applicationColumns: MapColumnGroup[] = [];
  public quickLinks: QuickLinkItem[] = [];
  public showMainParking = true;
  public readonly getApplicationRoute = getApplicationRoute;

  public ngOnInit(): void {
    const data = this.route.snapshot.data as EventMapsRouteData;
    this.title = data.title;
    this.intro = data.intro;
    this.showMainParking = data.mainParking !== false;
    this.quickLinks =
      data.quickLinks === false
        ? []
        : this.discoveryService.getQuickLinkApplications().map((app) => ({
            label: app.name,
            routerLink: getApplicationRoute(app)
          }));

    // Category pages are a navigation directory of every map of this type, not an upcoming-only list.
    //
    // A map with `visible: false` is development-only, so this page takes the unfiltered list and
    // applies the environment test itself. Taking the visible-filtered list hid those maps on
    // development too, which is the whole point of listing them there: the two new campuses were added
    // with that flag and then appeared nowhere (#2449).
    //
    // `TestingService.isTesting`, the same test the All Maps page uses, so the two pages agree about
    // which campuses exist - and `?as=production` hides them here as it does there. Deliberately not
    // `readsDevelopmentGisServer()`, which answers a different question: that one governs which GIS
    // server to read and treats localhost as production, so using it would have hidden these maps
    // from anyone running the application locally.
    const isTesting = this.testing.isTesting;

    const forThisType = this.discoveryService
      .getInternalDiscoverApplications()
      .filter((app) => app.mapTypes.includes(data.mapType));

    this.applications = sortApplicationsByName(
      forThisType.filter((app) => isTesting || app.visible !== false)
    );
    this.applicationColumns = buildMapColumnGroups(this.applications, data.columns);
  }
}
