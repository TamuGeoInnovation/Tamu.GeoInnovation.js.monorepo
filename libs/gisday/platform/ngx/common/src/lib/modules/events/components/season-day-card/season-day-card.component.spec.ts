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
});
