import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { EventDefinitions, ISpecialEventRoot } from '@tamu-gisc/ts/events/ngx';
import { Router } from '@angular/router';

interface EventSummary {
  id: string;
  name: string;
  eventDates: Array<string | Date | number>;
  displayName: string;
}

@Component({
  selector: 'tamu-gisc-aggiemap-discover',
  templateUrl: './discover.component.html',
  styleUrls: ['./discover.component.scss']
})
export class DiscoverComponent implements OnInit {
  public searchControl = new FormControl();
  public filteredEvents: Observable<EventSummary[]>;
  public upcomingEvents: EventSummary[] = [];

  private allEvents: EventSummary[] = [];

  constructor(private readonly rt: Router) {
    // Transform event definitions into searchable format
    this.allEvents = EventDefinitions.map((eventDef: ISpecialEventRoot) => ({
      id: eventDef.configuration?.id || '',
      name: eventDef.configuration?.name || '',
      eventDates: eventDef.configuration?.eventDates || [],
      displayName: eventDef.configuration?.name || eventDef.configuration?.id || ''
    })).filter((event) => event.id && event.name);
  }

  public ngOnInit(): void {
    // Set up autocomplete filtering
    this.filteredEvents = this.searchControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filterEvents(value || ''))
    );

    // Calculate upcoming events
    this.upcomingEvents = this.getUpcomingEvents();
  }

  private _filterEvents(value: string): EventSummary[] {
    if (!value) {
      return this.allEvents.slice(0, 10); // Show first 10 when no search
    }

    const filterValue = value.toLowerCase();
    return this.allEvents.filter(
      (event) => event.name.toLowerCase().includes(filterValue) || event.id.toLowerCase().includes(filterValue)
    );
  }

  private getUpcomingEvents(): EventSummary[] {
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
    return new Date(date).getTime();
  }

  private getEarliestUpcomingDate(dates: Array<string | Date | number>, now: number): number {
    const upcomingDates = dates.map((date) => this.parseEventDate(date)).filter((time) => time >= now);

    return upcomingDates.length > 0 ? Math.min(...upcomingDates) : Number.MAX_SAFE_INTEGER;
  }

  public onEventSelect(event: unknown): void {
    const e = event as EventSummary;
    // Navigate to events intro page
    this.rt.navigate([`/events`, e.id]);
  }

  public displayEventOption(e: unknown): string {
    const maybe = e as EventSummary;
    if (!maybe) {
      return '';
    }
    return maybe.name || maybe.id || '';
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
}
