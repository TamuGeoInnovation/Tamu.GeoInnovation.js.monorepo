import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { combineLatest, Observable } from 'rxjs';
import { debounceTime, map, shareReplay, startWith } from 'rxjs/operators';

import { TestingService } from '@tamu-gisc/dev-tools/application-testing';

import {
  DiscoverApplication,
  ExternalDiscoverApplication,
  InternalDiscoverApplication
} from '../../interfaces/discover-application.interface';
import { DiscoveryService, FEATURED_PARKING_ID } from '../../services/discovery/discovery.service';
import { getApplicationRoute, getEventDateRange, parseEventDate } from '../discover.utils';

/**
 * "All Maps" landing page. Surfaces the Visit Maps quick links, a map search, and the top upcoming
 * events. The dev-only "All Events" and "Experimental Applications" sections are preserved here.
 */
@Component({
  selector: 'tamu-gisc-aggiemap-all-maps',
  templateUrl: './all-maps.component.html',
  styleUrls: ['./all-maps.component.scss']
})
export class AllMapsComponent implements OnInit {
  public readonly mainParkingRoute = ['/parking', FEATURED_PARKING_ID];

  public externalApplications: ExternalDiscoverApplication[];
  private internalApplications: InternalDiscoverApplication[];
  private allApplications: DiscoverApplication[];

  public upcomingApplications: InternalDiscoverApplication[] = [];

  public searchControl = new FormControl();
  public filteredApplications: Observable<DiscoverApplication[]>;
  public isDev: Observable<boolean>;

  public readonly getApplicationRoute = getApplicationRoute;
  public readonly getEventDateRange = getEventDateRange;

  constructor(
    private readonly rt: Router,
    private readonly discoveryService: DiscoveryService,
    private readonly dev: TestingService
  ) {}

  public ngOnInit(): void {
    this.isDev = this.dev.get('isTesting');
    this.internalApplications = this.discoveryService.getInternalDiscoverApplications();
    this.externalApplications = this.discoveryService.getExternalDiscoverApplications();
    this.allApplications = this.discoveryService.getAllDiscoverApplications();

    this.filteredApplications = combineLatest([this.searchControl.valueChanges.pipe(startWith('')), this.isDev]).pipe(
      debounceTime(100),
      map(([value, isDev]) => this._filterApplications(value || '', isDev)),
      shareReplay(1)
    );

    this.upcomingApplications = this.getUpcomingApplications();
  }

  public get allEvents(): InternalDiscoverApplication[] {
    return this.internalApplications
      .filter((app) => app.mapType === 'campus' || app.mapType === 'athletics')
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

    return this.discoveryService
      .getVisibleInternalDiscoverApplications()
      .map((app) => ({
        app,
        earliestUpcomingDate: this.getEarliestUpcomingDate(app.configuration.eventDates, now)
      }))
      .filter(({ earliestUpcomingDate }) => earliestUpcomingDate !== Number.POSITIVE_INFINITY)
      .sort((a, b) => a.earliestUpcomingDate - b.earliestUpcomingDate || a.app.name.localeCompare(b.app.name))
      .slice(0, 3)
      .map(({ app }) => app);
  }

  private getEarliestUpcomingDate(dates: Array<string | Date | number>, now: number): number {
    const upcomingDates = dates
      .map((date) => parseEventDate(date))
      .filter((time) => Number.isFinite(time) && time >= now);

    return upcomingDates.length > 0 ? Math.min(...upcomingDates) : Number.POSITIVE_INFINITY;
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
