import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { EventRowComponent } from './event-row.component';

describe('EventRowComponent', () => {
  /**
   * #2710. The Sessions page says its times are Central, so a session at 9:00 AM Central reads 9:00 AM to a visitor
   * anywhere, not 7:00 AM in Pacific time.
   */
  it.each(['America/Chicago', 'America/Los_Angeles', 'America/New_York', 'UTC'])('shows the times in Central, in %s', (zone) => {
    const was = process.env.TZ;
    process.env.TZ = zone;

    try {
      TestBed.configureTestingModule({ providers: [provideRouter([])] });

      const fixture = TestBed.createComponent(EventRowComponent);
      fixture.componentRef.setInput('day', { guid: 'day', date: '2026-11-19T06:00:00.000Z' as unknown as Date });
      fixture.componentRef.setInput('event', {
        guid: 'a',
        name: 'Opening keynote',
        startTime: '09:00:00 GMT-0600 (Central Standard Time)',
        endTime: '09:30:00 GMT-0600 (Central Standard Time)'
      });
      fixture.componentRef.setInput('rsvps', []);
      fixture.detectChanges();

      const time = (fixture.nativeElement as HTMLElement).querySelector('.event-time').textContent.replace(/\s+/g, ' ').trim();

      expect(time).toBe('9:00 AM - 9:30 AM');
    } finally {
      process.env.TZ = was;
    }
  });
});
