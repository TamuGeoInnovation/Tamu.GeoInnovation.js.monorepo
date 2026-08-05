import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { DiscoverMapType } from '@tamu-gisc/ts/events/ngx';

import { InternalDiscoverApplication } from '../../interfaces/discover-application.interface';
import { DiscoveryService } from '../../services/discovery/discovery.service';
import { getApplicationRoute, sortApplicationsByName } from '../discover.utils';
import { QuickLinkItem } from '../quick-links/quick-links.component';

interface EventMapsRouteData {
  mapType: Extract<DiscoverMapType, 'campus' | 'athletics'>;
  title: string;
  intro?: string;
}

/**
 * Shared page for the event map categories (Campus Events, Athletics Events). The category is
 * supplied via the route `data` so a single component serves both routes.
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
  public quickLinks: QuickLinkItem[] = [];
  public readonly getApplicationRoute = getApplicationRoute;

  constructor(private readonly route: ActivatedRoute, private readonly discoveryService: DiscoveryService) {}

  public ngOnInit(): void {
    const data = this.route.snapshot.data as EventMapsRouteData;
    this.title = data.title;
    this.intro = data.intro;
    this.quickLinks = this.discoveryService.getQuickLinkApplications().map((app) => ({
      label: app.name,
      routerLink: getApplicationRoute(app)
    }));

    // Category pages are a navigation directory of every map of this type, not an upcoming-only list.
    this.applications = sortApplicationsByName(
      this.discoveryService.getVisibleInternalDiscoverApplications().filter((app) => app.mapType === data.mapType)
    );
  }
}
