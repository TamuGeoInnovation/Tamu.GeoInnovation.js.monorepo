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

  const upcomingAt = async (now: Date): Promise<string[]> => {
    jest.useFakeTimers({ now, doNotFake: ['nextTick', 'setImmediate', 'setTimeout', 'setInterval', 'queueMicrotask'] });

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, RouterTestingModule],
      declarations: [AllMapsComponent],
      providers: [
        { provide: DiscoveryService, useValue: discoveryStub },
        { provide: TestingService, useValue: { get: () => of(false) } },
        { provide: LastMapService, useValue: { url: '/map', path: '/map', queryParams: {}, fragment: undefined } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    const fixture = TestBed.createComponent(AllMapsComponent);

    fixture.detectChanges();

    return fixture.componentInstance.upcomingApplications.map((upcoming) => upcoming.name);
  };

  afterEach(() => {
    TestBed.resetTestingModule();
    jest.useRealTimers();
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
