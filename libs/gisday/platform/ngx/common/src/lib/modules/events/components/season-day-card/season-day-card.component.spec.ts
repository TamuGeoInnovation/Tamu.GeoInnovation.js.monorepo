import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { SeasonDayService } from '@tamu-gisc/gisday/platform/ngx/data-access';

import { SeasonDayCardComponent } from './season-day-card.component';

describe('SeasonDayCardComponent', () => {
  // The card and its event row once imported each other. Whichever file loaded second saw the other
  // as undefined, so no row could be created and the day's card stayed empty (NG0919, #1642).
  it("shows a row for each of the day's events", () => {
    const events = [
      { guid: 'a', name: 'Opening keynote', tags: [], organizations: [] },
      { guid: 'b', name: 'Mapathon', tags: [], organizations: [] }
    ];

    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: SeasonDayService, useValue: { getDayEvents: () => of(events) } }]
    });

    const fixture = TestBed.createComponent(SeasonDayCardComponent);
    fixture.componentRef.setInput('seasonDay', { guid: 'day', date: new Date(2026, 10, 16) });
    fixture.detectChanges();

    const names = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('tamu-gisc-event-row .name'),
      (name) => name.textContent
    );

    expect(names).toEqual(['Opening keynote', 'Mapathon']);
  });

  /**
   * #2142. Texas A&M's site shares txgisday.org's database, so a day can hold another organization's sessions; the
   * site passes the places it lists, and the card leaves out the rest, with or without the visitor's filters.
   */
  it('leaves out events whose place is not one the site lists', () => {
    const events = [
      { guid: 'a', name: 'Texas A&M keynote', tags: ['t'], organizations: ['tamu-place'] },
      { guid: 'b', name: 'Another school workshop', tags: ['t'], organizations: ['other-place'] },
      { guid: 'c', name: 'No place yet', tags: ['t'], organizations: [] }
    ];

    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: SeasonDayService, useValue: { getDayEvents: () => of(events) } }]
    });

    const fixture = TestBed.createComponent(SeasonDayCardComponent);
    fixture.componentRef.setInput('seasonDay', { guid: 'day', date: new Date(2026, 10, 16) });
    fixture.componentRef.setInput('onlyFrom', ['tamu-place']);
    fixture.detectChanges();

    const names = () =>
      Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('tamu-gisc-event-row .name'), (name) => name.textContent);

    expect(names()).toEqual(['Texas A&M keynote']);

    fixture.componentRef.setInput('tags', ['t']);
    fixture.detectChanges();

    expect(names()).toEqual(['Texas A&M keynote']);
  });

  it('lists every place when the site lists them all', () => {
    const events = [
      { guid: 'a', name: 'Texas A&M keynote', tags: [], organizations: ['tamu-place'] },
      { guid: 'b', name: 'Another school workshop', tags: [], organizations: ['other-place'] }
    ];

    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: SeasonDayService, useValue: { getDayEvents: () => of(events) } }]
    });

    const fixture = TestBed.createComponent(SeasonDayCardComponent);
    fixture.componentRef.setInput('seasonDay', { guid: 'day', date: new Date(2026, 10, 16) });
    fixture.componentRef.setInput('onlyFrom', null);
    fixture.detectChanges();

    const names = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('tamu-gisc-event-row .name'),
      (name) => name.textContent
    );

    expect(names).toEqual(['Texas A&M keynote', 'Another school workshop']);
  });
});
