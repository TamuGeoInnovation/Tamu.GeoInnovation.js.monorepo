import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { combineLatest, Observable } from 'rxjs';
import { debounceTime, map, shareReplay, startWith } from 'rxjs/operators';

import { DiscoverMapType } from '@tamu-gisc/ts/events/ngx';

import {
  DiscoverApplication,
  ExternalDiscoverApplication,
  InternalDiscoverApplication
} from '../interfaces/discover-application.interface';
import { DiscoveryService } from '../services/discovery/discovery.service';
import { TestingService } from '@tamu-gisc/dev-tools/application-testing';

interface DiscoverTab {
  id: DiscoverMapType;
  label: string;
}

@Component({
  selector: 'tamu-gisc-aggiemap-discover',
  templateUrl: './discover.component.html',
  styleUrls: ['./discover.component.scss']
})
export class DiscoverComponent implements OnInit, OnDestroy {
  public readonly discoverTabs: ReadonlyArray<DiscoverTab> = [
    { id: 'parking', label: 'Parking Maps' },
    { id: 'campus', label: 'Campus Events' },
    { id: 'athletics', label: 'Athletic Events' },
    { id: 'operations', label: 'Operations Maps' }
  ];

  public activeTab: DiscoverMapType = 'parking';

  public externalApplications: ExternalDiscoverApplication[];
  private eventDiscoverApplications: InternalDiscoverApplication[];
  public allApplications: DiscoverApplication[];

  public upcomingApplications: InternalDiscoverApplication[] = [];

  public parkingColumns: InternalDiscoverApplication[][] = [[], []];
  public parkingColumnStart = 1;

  public campusColumns: InternalDiscoverApplication[][] = [[], []];
  public campusColumnStart = 1;

  public athleticColumns: InternalDiscoverApplication[][] = [[], []];
  public athleticColumnStart = 1;

  public operationsColumns: InternalDiscoverApplication[][] = [[], []];
  public operationsColumnStart = 1;

  public allEventsColumns: InternalDiscoverApplication[][] = [[], []];
  public allEventsColumnStart = 1;

  public searchControl = new FormControl();
  public filteredApplications: Observable<DiscoverApplication[]>;
  public isDev: Observable<boolean>;
  private readonly validTabIds = new Set(this.discoverTabs.map((tab) => tab.id));
  private readonly hashChangeHandler = () => this.syncActiveTabWithHash();

  constructor(
    private readonly rt: Router,
    private readonly discoveryService: DiscoveryService,
    private readonly dev: TestingService
  ) {}

  public ngOnInit(): void {
    this.isDev = this.dev.get('isTesting');
    this.eventDiscoverApplications = this.discoveryService.getInternalDiscoverApplications();
    this.externalApplications = this.discoveryService.getExternalDiscoverApplications();
    this.allApplications = this.discoveryService.getAllDiscoverApplications();

    this.filteredApplications = combineLatest([this.searchControl.valueChanges.pipe(startWith('')), this.isDev]).pipe(
      debounceTime(100),
      map(([value, isDev]) => this._filterApplications(value || '', isDev)),
      shareReplay(1)
    );

    this.upcomingApplications = this.getUpcomingApplications();

    const parkingApplications = this.getApplicationsByMapType('parking');
    this.parkingColumns = this.buildApplicationColumns(parkingApplications);
    this.parkingColumnStart = this.getSecondColumnStart(this.parkingColumns);

    const campusApplications = this.getApplicationsByMapType('campus');
    const upcomingCampus = this.filterUpcomingEvents(campusApplications);
    this.campusColumns = this.buildApplicationColumns(upcomingCampus);
    this.campusColumnStart = this.getSecondColumnStart(this.campusColumns);

    const athleticApplications = this.getApplicationsByMapType('athletics');
    const upcomingAthletic = this.filterUpcomingEvents(athleticApplications);
    this.athleticColumns = this.buildApplicationColumns(upcomingAthletic);
    this.athleticColumnStart = this.getSecondColumnStart(this.athleticColumns);

    const operationsApplications = this.getApplicationsByMapType('operations');
    this.operationsColumns = this.buildApplicationColumns(operationsApplications);
    this.operationsColumnStart = this.getSecondColumnStart(this.operationsColumns);

    const allEvents = this.sortEventApplications([...campusApplications, ...athleticApplications]);
    this.allEventsColumns = this.buildApplicationColumns(allEvents);
    this.allEventsColumnStart = this.getSecondColumnStart(this.allEventsColumns);

    this.syncActiveTabWithHash();
    window.addEventListener('hashchange', this.hashChangeHandler);
  }

  public ngOnDestroy(): void {
    window.removeEventListener('hashchange', this.hashChangeHandler);
  }

  private getApplicationsByMapType(mapType: DiscoverMapType): InternalDiscoverApplication[] {
    const applications = this.eventDiscoverApplications.filter((app) => app.mapType === mapType);

    if (mapType === 'parking') {
      return applications.sort((a, b) => a.name.localeCompare(b.name));
    }

    return this.sortEventApplications(applications);
  }

  private getUpcomingApplications(): InternalDiscoverApplication[] {
    const now = Date.now();

    return this.eventDiscoverApplications
      .map((app) => ({
        app,
        earliestUpcomingDate: this.getEarliestUpcomingDate(app.configuration.eventDates, now)
      }))
      .filter(({ earliestUpcomingDate }) => earliestUpcomingDate !== Number.POSITIVE_INFINITY)
      .sort((a, b) => a.earliestUpcomingDate - b.earliestUpcomingDate || a.app.name.localeCompare(b.app.name))
      .slice(0, 3)
      .map(({ app }) => app);
  }

  private buildApplicationColumns(apps: InternalDiscoverApplication[]): InternalDiscoverApplication[][] {
    const midpoint = Math.ceil(apps.length / 2);
    return [apps.slice(0, midpoint), apps.slice(midpoint)];
  }

  private getSecondColumnStart(columns: InternalDiscoverApplication[][]): number {
    return columns[0].length + 1;
  }

  private filterUpcomingEvents(apps: InternalDiscoverApplication[]): InternalDiscoverApplication[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayMs = today.getTime();

    return apps.filter((app) => {
      const dates = app.configuration.eventDates;
      if (!dates || dates.length === 0) return true;
      return dates.some((date) => this.parseEventDate(date) >= todayMs);
    });
  }

  private sortEventApplications(apps: InternalDiscoverApplication[]): InternalDiscoverApplication[] {
    return apps.sort((a, b) => a.name.localeCompare(b.name));
  }

  private _filterApplications(value: string, isDev: boolean): DiscoverApplication[] {
    let filtered;

    if (isDev) {
      filtered = this.allApplications;
    } else {
      filtered = this.allApplications.filter((app) => app.type !== 'experiment');
    }

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

  private parseEventDate(date: string | Date | number): number {
    if (typeof date === 'number') {
      return date;
    }

    if (date instanceof Date) {
      return date.getTime();
    }

    const dateOnlyMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (dateOnlyMatch) {
      const [, year, month, day] = dateOnlyMatch;
      return new Date(Number(year), Number(month) - 1, Number(day)).getTime();
    }

    return new Date(date).getTime();
  }

  private getEarliestUpcomingDate(dates: Array<string | Date | number>, now: number): number {
    const upcomingDates = dates
      .map((date) => this.parseEventDate(date))
      .filter((time) => Number.isFinite(time) && time >= now);

    return upcomingDates.length > 0 ? Math.min(...upcomingDates) : Number.POSITIVE_INFINITY;
  }

  public onApplicationSelect(app: DiscoverApplication | undefined): void {
    if (!app) return;

    if (app.source === 'external') {
      window.open((app as ExternalDiscoverApplication).location, '_blank');
    } else if (app.source === 'internal') {
      const config = (app as InternalDiscoverApplication).configuration;
      const routeSegment = app.type === 'event' ? 'events' : app.type;
      this.rt.navigate([`/${routeSegment}`, config.id]);
    }
  }

  public getApplicationRoute(app: InternalDiscoverApplication): string[] {
    const routeSegment = app.type === 'event' ? 'events' : app.type;
    return [`/${routeSegment}`, app.id];
  }

  public setActiveTab(tab: DiscoverMapType): void {
    this.activeTab = tab;
    this.updateHash(tab);
  }

  public getEventDateRange(dates: Array<string | Date | number>): string {
    if (!dates || dates.length === 0) {
      return 'No dates available';
    }

    const parsedDates = dates.map((date) => this.parseEventDate(date)).sort((a, b) => a - b);
    const startDate = new Date(parsedDates[0]);
    const endDate = new Date(parsedDates[parsedDates.length - 1]);

    if (parsedDates.length === 1) {
      return startDate.toLocaleDateString();
    }

    return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
  }

  private syncActiveTabWithHash(): void {
    const tab = this.parseTabFromHash(window.location.hash);

    if (tab) {
      this.activeTab = tab;
    }
  }

  private parseTabFromHash(hash: string): DiscoverMapType | undefined {
    const normalizedHash = hash.replace(/^#/, '').trim().toLowerCase();

    if (!normalizedHash) {
      return undefined;
    }

    const candidate = normalizedHash
      .replace(/^discover-tab-/, '')
      .replace(/^discover-panel-/, '') as DiscoverMapType;

    return this.validTabIds.has(candidate) ? candidate : undefined;
  }

  private updateHash(tab: DiscoverMapType): void {
    const nextHash = `#discover-tab-${tab}`;

    if (window.location.hash === nextHash) {
      return;
    }

    window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.search}${nextHash}`);
  }
}
