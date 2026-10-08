import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { TestingService } from '@tamu-gisc/dev-tools/application-testing';

import { DiscoveryService } from '../../services/discovery/discovery.service';
import { LastMapService } from '../../services/last-map/last-map.service';
import { AllMapsComponent } from './all-maps.component';

/**
 * Upcoming events include an event on the day it happens (#1301).
 *
 * At 00:12 on 2 October the list showed Football, Volleyball and 150 Cake & Ice Cream, and left out the
 * 150th Opening Ceremony and Kickoff at Kyle - both on 2 October. A date-only event date is local
 * midnight, so an event dated today was already "before now" a moment after midnight. An event is on
 * for its whole day, as #1298 made the event maps treat it.
 */
describe('AllMapsComponent upcoming events', () => {
  const app = (name: string, eventDates: string[]) => ({
    name,
    id: name.toLowerCase().replace(/\W+/g, '-'),
    type: 'event',
    mapTypes: ['campus'],
    configuration: { id: name, eventDates }
  });

  const apps = [
    app('Football', ['2026-09-05', '2026-10-03', '2026-11-27']),
    app('Volleyball', ['2026-08-11', '2026-10-04', '2026-11-15']),
    app('150 Cake & Ice Cream', ['2026-10-05']),
    app('150th Opening Ceremony', ['2026-10-02']),
    app('Kickoff at Kyle', ['2026-10-02']),
    app('Ring Day', ['2026-10-08', '2026-10-09', '2026-10-10'])
  ];

  const discoveryStub = {
    getInternalDiscoverApplications: () => apps,
    getVisibleInternalDiscoverApplications: () => apps,
    getExternalDiscoverApplications: () => [],
    getAllDiscoverApplications: () => apps,
    getKioskDiscoverApplications: () => [],
    getQuickLinkApplications: () => [],
    getParkingApplicationsByCategory: () => []
  };

  const renderAt = async (now: Date) => {
    jest.useFakeTimers({ now, doNotFake: ['nextTick', 'setImmediate', 'setTimeout', 'setInterval', 'queueMicrotask'] });

    await TestBed.configureTestingModule({
    imports: [ReactiveFormsModule, RouterTestingModule, AllMapsComponent],
    providers: [
        { provide: DiscoveryService, useValue: discoveryStub },
        { provide: TestingService, useValue: { get: () => of(false) } },
        { provide: LastMapService, useValue: { url: '/map', path: '/map', queryParams: {}, fragment: undefined } }
    ],
    schemas: [NO_ERRORS_SCHEMA]
}).compileComponents();

    const fixture = TestBed.createComponent(AllMapsComponent);

    fixture.detectChanges();

    return fixture;
  };

  const upcomingAt = async (now: Date): Promise<string[]> => {
    const fixture = await renderAt(now);

    return fixture.componentInstance.upcomingApplications.map((upcoming) => upcoming.name);
  };

  /** The dates each upcoming event renders, paired with its name, as a visitor reads them. */
  const renderedDatesAt = async (now: Date): Promise<Array<[string, string]>> => {
    const fixture = await renderAt(now);

    return Array.from(fixture.nativeElement.querySelectorAll('.upcoming-events-section .event-card')).map((card) => {
      const element = card as HTMLElement;

      return [
        element.querySelector('.event-title')?.textContent?.trim() ?? '',
        element.querySelector('.event-dates')?.textContent?.replace(/\s+/g, ' ').trim() ?? ''
      ] as [string, string];
    });
  };

  afterEach(() => {
    TestBed.resetTestingModule();
    jest.useRealTimers();
  });

  /**
   * A repeat event showed its whole range rather than the date a visitor is about to turn up for
   * (#1443). Ring Day runs 8-10 October, and on 6 October the list read "Dates: 10/8/2026 -
   * 10/10/2026". The range is the wrong answer to "when is the next one": it is three numbers to
   * read where one will do, and the end of it is the date nobody is going to.
   *
   * The dates are compared against `toLocaleDateString()` rather than a written-out string, because
   * the component formats them that way and the locale this runs under is not the point of the test.
   */
  it("shows a repeat event's next date, not the range it spans", async () => {
    const rendered = await renderedDatesAt(new Date(2026, 9, 6, 9, 0));
    const ringDay = rendered.find(([name]) => name === 'Ring Day');

    expect(ringDay).toBeDefined();
    expect(ringDay?.[1]).toBe(`Next: ${new Date(2026, 9, 8).toLocaleDateString()}`);
    expect(ringDay?.[1]).not.toContain(new Date(2026, 9, 10).toLocaleDateString());
  });

  it('shows one date on every card, so the list reads the same way down the page', async () => {
    const rendered = await renderedDatesAt(new Date(2026, 9, 6, 9, 0));

    expect(rendered).toEqual([
      ['Ring Day', `Next: ${new Date(2026, 9, 8).toLocaleDateString()}`],
      ['Volleyball', `Next: ${new Date(2026, 10, 15).toLocaleDateString()}`],
      ['Football', `Next: ${new Date(2026, 10, 27).toLocaleDateString()}`]
    ]);
  });

  it("lists today's events first, just after midnight on the day", async () => {
    expect(await upcomingAt(new Date(2026, 9, 2, 0, 12))).toEqual(['150th Opening Ceremony', 'Kickoff at Kyle', 'Football']);
  });

  it('still lists them late on the day', async () => {
    expect(await upcomingAt(new Date(2026, 9, 2, 23, 30))).toEqual([
      '150th Opening Ceremony',
      'Kickoff at Kyle',
      'Football'
    ]);
  });

  it("drops them the next day, and orders by each event's next date", async () => {
    expect(await upcomingAt(new Date(2026, 9, 3, 0, 5))).toEqual(['Football', 'Volleyball', '150 Cake & Ice Cream']);
  });
});
