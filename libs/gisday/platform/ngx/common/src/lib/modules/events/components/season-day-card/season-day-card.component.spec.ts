import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';

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
    fixture.componentRef.setInput('index', 0);
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
    fixture.componentRef.setInput('index', 0);
    fixture.componentRef.setInput('onlyFrom', ['tamu-place']);
    fixture.detectChanges();

    const names = () =>
      Array.from(
        (fixture.nativeElement as HTMLElement).querySelectorAll('tamu-gisc-event-row .name'),
        (name) => name.textContent
      );

    expect(names()).toEqual(['Texas A&M keynote']);

    fixture.componentRef.setInput('tags', ['t']);
    fixture.detectChanges();

    expect(names()).toEqual(['Texas A&M keynote']);
  });

  /**
   * #2708. Each day is headed with its weekday, and in Central time whatever the visitor's own: the API sends a day as
   * midnight Central, which in Pacific time is still the evening before.
   */
  it('heads the day with its weekday, month and day, in Central time', () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: SeasonDayService, useValue: { getDayEvents: () => of([]) } }]
    });

    const heading = (date: string) => {
      const fixture = TestBed.createComponent(SeasonDayCardComponent);
      fixture.componentRef.setInput('seasonDay', { guid: 'day', date: date as unknown as Date });
      fixture.componentRef.setInput('index', 0);
      fixture.detectChanges();

      // The date, without the open and close mark the heading now carries (#3221).
      return (fixture.nativeElement as HTMLElement).querySelector('h2 .day-date').textContent.trim();
    };

    expect(heading('2026-11-19T06:00:00.000Z')).toBe('Thursday, November 19');
    expect(heading('2026-11-09T06:00:00.000Z')).toBe('Monday, November 9');
    // The last moment of the Central day, already the next day in UTC.
    expect(heading('2026-11-20T05:59:00.000Z')).toBe('Thursday, November 19');
  });

  /**
   * #2944. The Sessions page's search: the card lists the sessions whose name, building, room or presenter matches,
   * alongside the tags, says how many it shows, and is left out altogether when a search finds none of its sessions.
   */
  it('lists only the sessions the search finds, and leaves the day out when it finds none', () => {
    const events = [
      {
        guid: 'a',
        name: 'Opening keynote',
        location: { building: 'Rudder Tower', room: '301' },
        presenters: ['José Ortiz'],
        tags: ['t'],
        organizations: []
      },
      {
        guid: 'b',
        name: 'Mapathon',
        location: { building: 'Evans Library', room: '204' },
        presenters: [],
        tags: [],
        organizations: []
      }
    ];

    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: SeasonDayService, useValue: { getDayEvents: () => of(events) } }]
    });

    const fixture = TestBed.createComponent(SeasonDayCardComponent);
    const counts: Array<number> = [];
    fixture.componentInstance.matches.subscribe((count) => counts.push(count));
    fixture.componentRef.setInput('seasonDay', { guid: 'day', date: new Date(2026, 10, 16) });
    fixture.componentRef.setInput('index', 0);
    fixture.componentRef.setInput('search', 'jose');
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const names = () => Array.from(root.querySelectorAll('tamu-gisc-event-row .name'), (name) => name.textContent);

    expect(names()).toEqual(['Opening keynote']);
    expect(counts[counts.length - 1]).toBe(1);

    fixture.componentRef.setInput('search', 'library');
    fixture.componentRef.setInput('tags', ['t']);
    fixture.detectChanges();

    expect(root.querySelector('.card')).toBeNull();
    expect(counts[counts.length - 1]).toBe(0);

    // With no search, a filter that matches nothing still says so in the day's card, as before.
    fixture.componentRef.setInput('search', '');
    fixture.componentRef.setInput('tags', ['none']);
    fixture.detectChanges();

    expect(root.querySelector('.card')?.textContent).toContain('No matching events for filter criteria.');
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
    fixture.componentRef.setInput('index', 0);
    fixture.componentRef.setInput('onlyFrom', null);
    fixture.detectChanges();

    const names = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('tamu-gisc-event-row .name'),
      (name) => name.textContent
    );

    expect(names).toEqual(['Texas A&M keynote', 'Another school workshop']);
  });

  /**
   * #3221. Each day opens and closes. On the current year's page a day that has passed starts collapsed, with its date
   * and how many sessions it has; today and the days to come start open; a past year's days all start open; a search
   * opens every day it finds something in; and the page's Day 1, Day 2 links open the day they jump to.
   */
  describe('collapsing a day', () => {
    const events = [
      { guid: 'a', name: 'Opening keynote', presenters: ['Ana Example'], tags: [], organizations: [] },
      { guid: 'b', name: 'Mapathon', presenters: [], tags: [], organizations: [] }
    ];
    // Three days either side of now, clear of midnight in Central time whatever the hour the tests run.
    const daysFromNow = (n: number) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

    function draw({
      day,
      collapsePassed = true,
      fragment = null
    }: {
      day: Date;
      collapsePassed?: boolean;
      fragment?: string | null;
    }) {
      const fragment$ = new BehaviorSubject<string | null>(fragment);

      TestBed.configureTestingModule({
        providers: [
          provideRouter([]),
          { provide: ActivatedRoute, useValue: { fragment: fragment$ } },
          { provide: SeasonDayService, useValue: { getDayEvents: () => of(events) } }
        ]
      });

      const fixture = TestBed.createComponent(SeasonDayCardComponent);
      fixture.componentRef.setInput('seasonDay', { guid: 'day', date: day });
      fixture.componentRef.setInput('index', 0);
      fixture.componentRef.setInput('collapsePassed', collapsePassed);
      fixture.detectChanges();

      const root = fixture.nativeElement as HTMLElement;
      const open = () => root.querySelector('.content-container')?.classList.contains('expanded') ?? false;
      const header = () => root.querySelector('tamu-gisc-accordion-header') as HTMLElement;
      const heading = () => root.querySelector('h2')?.textContent?.replace(/\s+/g, ' ').trim() ?? '';

      return { fixture, open, header, heading, fragment$ };
    }

    it('starts a day that has passed collapsed, with how many sessions it has', () => {
      const { open, heading, header } = draw({ day: daysFromNow(-3) });

      expect(open()).toBe(false);
      expect(header().getAttribute('aria-expanded')).toBe('false');
      expect(heading()).toContain('· 2 sessions');
    });

    it('starts today and the days to come open, with no count', () => {
      for (const day of [new Date(), daysFromNow(3)]) {
        TestBed.resetTestingModule();
        const { open, heading } = draw({ day });

        expect(open()).toBe(true);
        expect(heading()).not.toContain('sessions');
      }
    });

    it("starts every day open on a past year's page", () => {
      const { open } = draw({ day: daysFromNow(-400), collapsePassed: false });

      expect(open()).toBe(true);
    });

    it('opens and closes from its heading', () => {
      const { fixture, open, header } = draw({ day: daysFromNow(-3) });

      header().click();
      fixture.detectChanges();

      expect(open()).toBe(true);

      header().click();
      fixture.detectChanges();

      expect(open()).toBe(false);
    });

    it('opens while a search finds something in it, and goes back as it was when the search is cleared', () => {
      const { fixture, open } = draw({ day: daysFromNow(-3) });

      fixture.componentRef.setInput('search', 'ana');
      fixture.detectChanges();

      expect(open()).toBe(true);

      fixture.componentRef.setInput('search', '');
      fixture.detectChanges();

      expect(open()).toBe(false);
    });

    it("opens when the page's link to it is followed", () => {
      const { fixture, open, fragment$ } = draw({ day: daysFromNow(-3) });

      fragment$.next('day1');
      fixture.detectChanges();

      expect(open()).toBe(true);
    });
  });
  /**
   * #3611. A session that lists no tags is one a tag filter leaves out, not one that stops the day listing any; a day
   * with no guid has no events to ask for; and a session with no guid is not handed on to be registered for.
   */
  describe('values the API may leave out', () => {
    const names = (root: HTMLElement) =>
      Array.from(root.querySelectorAll('tamu-gisc-event-row .name'), (name) => name.textContent);

    it('leaves out a session with no tags while a tag filter is on, and lists the rest', () => {
      const events = [
        { guid: 'a', name: 'Tagged', tags: ['t'], organizations: [] },
        { guid: 'b', name: 'Untagged', organizations: [] }
      ];

      TestBed.configureTestingModule({
        providers: [provideRouter([]), { provide: SeasonDayService, useValue: { getDayEvents: () => of(events) } }]
      });

      const fixture = TestBed.createComponent(SeasonDayCardComponent);
      fixture.componentRef.setInput('seasonDay', { guid: 'day', date: new Date(2026, 10, 16) });
      fixture.componentRef.setInput('index', 0);
      fixture.componentRef.setInput('tags', ['t']);
      fixture.detectChanges();

      expect(names(fixture.nativeElement)).toEqual(['Tagged']);
    });

    it('asks for no events for a day with no guid, and says none are scheduled', () => {
      const getDayEvents = vi.fn(() => of([{ guid: 'a', name: 'Opening keynote', tags: [], organizations: [] }]));

      TestBed.configureTestingModule({
        providers: [provideRouter([]), { provide: SeasonDayService, useValue: { getDayEvents } }]
      });

      const fixture = TestBed.createComponent(SeasonDayCardComponent);
      fixture.componentRef.setInput('seasonDay', { date: new Date(2026, 10, 16) });
      fixture.componentRef.setInput('index', 0);
      fixture.detectChanges();

      expect(getDayEvents).not.toHaveBeenCalled();
      expect((fixture.nativeElement as HTMLElement).textContent).toContain('No events scheduled for this day.');
    });

    it('hands on no registration for a session with no guid', () => {
      TestBed.configureTestingModule({
        providers: [provideRouter([]), { provide: SeasonDayService, useValue: { getDayEvents: () => of([]) } }]
      });

      const fixture = TestBed.createComponent(SeasonDayCardComponent);
      fixture.componentRef.setInput('seasonDay', { guid: 'day', date: new Date(2026, 10, 16) });
      fixture.componentRef.setInput('index', 0);
      fixture.detectChanges();

      const handed: Array<string> = [];
      fixture.componentInstance.register.subscribe((guid) => handed.push(guid));
      fixture.componentInstance.unregister.subscribe((guid) => handed.push(guid));

      fixture.componentInstance.handoff({ name: 'Opening keynote' }, true);
      fixture.componentInstance.handoff({ name: 'Opening keynote' }, false);
      fixture.componentInstance.handoff({ guid: 'a', name: 'Opening keynote' }, true);

      expect(handed).toEqual(['a']);
    });
  });
});
