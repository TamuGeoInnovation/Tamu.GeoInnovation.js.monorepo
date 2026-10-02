import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { DiscoverMapType } from '@tamu-gisc/ts/events/ngx';

import { InternalDiscoverApplication } from '../../interfaces/discover-application.interface';
import { DiscoveryService } from '../../services/discovery/discovery.service';
import { buildMapColumnGroups, getApplicationRoute, sortApplicationsByName, MapColumnDefinition, MapColumnGroup } from '../discover.utils';
import { QuickLinkItem } from '../quick-links/quick-links.component';

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
}

/**
 * Shared page for the event map categories (Campus Events, Athletics Events, Campus Maps). The
 * category is supplied via the route `data` so a single component serves all of these routes.
 */
@Component({
  selector: 'tamu-gisc-aggiemap-event-maps',
  templateUrl: './event-maps.component.html',
  styleUrls: ['./event-maps.component.scss']
})
export class EventMapsComponent implements OnInit {
  public title: string;
  public intro?: string;

  public applications: InternalDiscoverApplication[] = [];
  public applicationColumns: MapColumnGroup[] = [];
  public quickLinks: QuickLinkItem[] = [];
  public readonly getApplicationRoute = getApplicationRoute;

  constructor(private readonly route: ActivatedRoute, private readonly discoveryService: DiscoveryService) {}

  public ngOnInit(): void {
    const data = this.route.snapshot.data as EventMapsRouteData;
    this.title = data.title;
    this.intro = data.intro;
    this.quickLinks =
      data.quickLinks === false
        ? []
        : this.discoveryService.getQuickLinkApplications().map((app) => ({
            label: app.name,
            routerLink: getApplicationRoute(app)
          }));

    // Category pages are a navigation directory of every map of this type, not an upcoming-only list.
    this.applications = sortApplicationsByName(
      this.discoveryService.getVisibleInternalDiscoverApplications().filter((app) => app.mapTypes.includes(data.mapType))
    );
    this.applicationColumns = buildMapColumnGroups(this.applications, data.columns);
  }
}
