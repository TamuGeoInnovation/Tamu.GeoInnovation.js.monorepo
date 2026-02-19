import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { combineLatest, Observable } from 'rxjs';
import { debounceTime, map, shareReplay, startWith } from 'rxjs/operators';

import { EventConfiguration } from '@tamu-gisc/ts/events/ngx';
import { Router } from '@angular/router';

import {
  DiscoverApplication,
  ExternalDiscoverApplication,
  InternalDiscoverApplication
} from '../interfaces/discover-application.interface';
import { DiscoveryService } from '../services/discovery/discovery.service';
import { TestingService } from '@tamu-gisc/dev-tools/application-testing';

@Component({
  selector: 'tamu-gisc-aggiemap-discover',
  templateUrl: './discover.component.html',
  styleUrls: ['./discover.component.scss']
})
export class DiscoverComponent implements OnInit {
  public externalApplications: ExternalDiscoverApplication[];
  private eventDiscoverApplications: InternalDiscoverApplication[];
  public allApplications: DiscoverApplication[];
  private allEvents: EventConfiguration[];
  public upcomingEvents: EventConfiguration[];
  public parkingApplications: InternalDiscoverApplication[];

  public searchControl = new FormControl();
  public filteredApplications: Observable<DiscoverApplication[]>;
  public isDev: Observable<boolean>;

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

    // Transform event definitions into searchable format
    this.allEvents = this.eventDiscoverApplications
      .map((e) => e.configuration)
      .filter((e: EventConfiguration) => {
        return e !== null && !!e?.id && !!e?.name;
      });

    // Set up autocomplete filtering
    this.filteredApplications = combineLatest([this.searchControl.valueChanges.pipe(startWith('')), this.isDev]).pipe(
      debounceTime(100),
      map(([value, isDev]) => this._filterApplications(value || '', isDev)),
      shareReplay(1)
    );

    // Calculate upcoming events
    this.upcomingEvents = this.getUpcomingEvents();

    // Build ordered parking list
    this.parkingApplications = this.getParkingApplications();
  }

  private getParkingApplications(): InternalDiscoverApplication[] {
    return this.eventDiscoverApplications
      .filter((app) => app.type === 'parking')
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  private _filterApplications(value: string, isDev: boolean): DiscoverApplication[] {
    let filtered;

    if (isDev) {
      filtered = this.allApplications;
    } else {
      filtered = this.allApplications.filter((app) => app.type !== 'experiment');
    }

    if (!value) {
      return filtered.slice(0, 10); // Show first 10 when no search
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

  private getUpcomingEvents(): EventConfiguration[] {
    const now = new Date().getTime();

    return this.allEvents
      .filter((event) => {
        // Check if any event date is upcoming or happening now
        return event.eventDates.some((date) => {
          const eventTime = this.parseEventDate(date);
          return eventTime >= now;
        });
      })
      .sort((a, b) => {
        // Sort by earliest upcoming date
        const aEarliest = this.getEarliestUpcomingDate(a.eventDates, now);
        const bEarliest = this.getEarliestUpcomingDate(b.eventDates, now);
        return aEarliest - bEarliest;
      })
      .slice(0, 3); // Top 3
  }

  private parseEventDate(date: string | Date | number): number {
    if (typeof date === 'number') {
      return date;
    }
    if (date instanceof Date) {
      return date.getTime();
    }
    // Treat date-only strings as local dates to avoid UTC day-shift issues.
    const dateOnlyMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (dateOnlyMatch) {
      const [, year, month, day] = dateOnlyMatch;
      return new Date(Number(year), Number(month) - 1, Number(day)).getTime();
    }
    return new Date(date).getTime();
  }

  private getEarliestUpcomingDate(dates: Array<string | Date | number>, now: number): number {
    const upcomingDates = dates.map((date) => this.parseEventDate(date)).filter((time) => time >= now);

    return upcomingDates.length > 0 ? Math.min(...upcomingDates) : Number.MAX_SAFE_INTEGER;
  }

  public onApplicationSelect(app: DiscoverApplication | undefined): void {
    if (!app) return;

    if (app.source === 'external') {
      window.open((app as ExternalDiscoverApplication).location, '_blank');
    } else if (app.source === 'internal') {
      const config = (app as InternalDiscoverApplication).configuration;
      // Navigate to events intro page
      const routeSegment = app.type === 'event' ? 'events' : app.type;
      this.rt.navigate([`/${routeSegment}`, config.id]);
    }
  }

  public displayApplicationOption(app: DiscoverApplication): string {
    return app.name || app.id || '';
  }

  public formatEventDate(date: string | Date | number): string {
    const dateObj = new Date(this.parseEventDate(date));
    return dateObj.toLocaleDateString();
  }

  public getEventDateRange(dates: Array<string | Date | number>): string {
    if (!dates || dates.length === 0) {
      return 'No dates available';
    }

    const parsedDates = dates.map((date) => this.parseEventDate(date)).sort();
    const startDate = new Date(parsedDates[0]);
    const endDate = new Date(parsedDates[parsedDates.length - 1]);

    if (parsedDates.length === 1) {
      return startDate.toLocaleDateString();
    }

    return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
  }

  public getApplicationFromEvent(event: EventConfiguration): DiscoverApplication | undefined {
    return this.allApplications.find(
      (app) => app.source === 'internal' && (app as InternalDiscoverApplication).configuration === event
    );
  }
}
