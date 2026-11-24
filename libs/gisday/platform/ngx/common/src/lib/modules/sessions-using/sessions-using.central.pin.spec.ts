import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { gisdaySite } from '@tamu-gisc/gisday/common';

import { GISDAY_SITE } from '../../site/site';
import { SessionsUsingComponent } from './sessions-using.component';

/**
 * The days and times the sessions-using list prints (#3323), either side of the November and March changes of 2026,
 * pinned before it formats through gisday/common's one Central-time module. The narrow no-break space before AM and PM
 * is compared as a plain space.
 */
describe("SessionsUsingComponent's Central days and times (#3323)", () => {
  it('prints each session as before', () => {
    TestBed.configureTestingModule({
      imports: [SessionsUsingComponent],
      providers: [provideRouter([]), { provide: GISDAY_SITE, useValue: gisdaySite('txgisday') }]
    });

    const fixture = TestBed.createComponent(SessionsUsingComponent);
    fixture.componentRef.setInput('sessions', [
      { guid: 'a', name: 'A', startTime: '18:30:00', day: { date: new Date('2026-10-31T05:00:00Z') } },
      { guid: 'b', name: 'B', startTime: '09:00:00', day: { date: new Date('2026-11-01T05:00:00Z') } },
      { guid: 'c', name: 'C', startTime: '22:30:00', day: { date: new Date('2026-03-07T06:00:00Z') } },
      { guid: 'd', name: 'D', startTime: '10:00:00', day: { date: new Date('2026-03-08T06:00:00Z') } }
    ]);
    fixture.detectChanges();

    expect(fixture.componentInstance.listed()?.map((s) => `${s.name} ${s.day} ${s.time.replace(/\u202f/g, ' ')}`)).toEqual([
      'C Sat, Mar 7 10:30 PM',
      'D Sun, Mar 8 10:00 AM',
      'A Sat, Oct 31 6:30 PM',
      'B Sun, Nov 1 9:00 AM'
    ]);
  });
});
