import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import {
  EventService,
  PlaceService,
  RsvpService,
  SeasonDayService,
  SeasonService,
  TagService,
  UserService
} from '@tamu-gisc/gisday/platform/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { AuthService } from '@tamu-gisc/common/ngx/auth';
import { SettingsService } from '@tamu-gisc/common/ngx/settings';

import { EventViewComponent } from './event-view.component';

/**
 * #2944: a search box above the public Sessions list, by a session's name, building or room, or a presenter's name.
 * It narrows alongside the Tags and Organizations filters, leaves out a day with no match, and says so when none do.
 */
describe('EventViewComponent search', () => {
  const days = [
    { guid: 'day-1', date: '2026-11-16T06:00:00.000Z' },
    { guid: 'day-2', date: '2026-11-17T06:00:00.000Z' }
  ];

  const eventsByDay: Record<string, Array<Record<string, unknown>>> = {
    'day-1': [
      {
        guid: 'a',
        name: 'Opening keynote',
        location: { building: 'Rudder Tower', room: '301' },
        presenters: ['José Ortiz'],
        tags: ['t-1'],
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
    ],
    'day-2': [
      {
        guid: 'c',
        name: 'Drone flights',
        location: { building: 'Rudder Tower', room: '601' },
        presenters: ['Ana Ruiz'],
        tags: [],
        organizations: []
      }
    ]
  };

  function open() {
    TestBed.configureTestingModule({
      imports: [EventViewComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: {}, queryParams: of({}) } },
        {
          provide: SeasonService,
          useValue: { seasonForRoute: () => of({ season: { guid: 's-1', days }, year: 2026, isPast: false }) }
        },
        { provide: SeasonDayService, useValue: { getDayEvents: (guid: string) => of(eventsByDay[guid]) } },
        { provide: TagService, useValue: { getEntitiesForSeason: () => of([{ guid: 't-1', name: 'Keynote' }]) } },
        { provide: PlaceService, useValue: { getEntitiesForSeason: () => of([]) } },
        {
          provide: SettingsService,
          useValue: { init: () => of({ tags: '', organizations: '' }), updateSettings: () => undefined }
        },
        { provide: AuthService, useValue: { isAuthenticated$: of(false), user$: of(null) } },
        { provide: EventService, useValue: {} },
        { provide: RsvpService, useValue: {} },
        { provide: UserService, useValue: {} },
        { provide: NotificationService, useValue: { toast: () => undefined } }
      ]
    });

    // The page writes its filters into the address; nothing here needs it to.
    jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(EventViewComponent);
    fixture.detectChanges();

    return fixture;
  }

  /** Types into the box, as a visitor would. */
  function search(fixture: ReturnType<typeof open>, text: string) {
    const box = root(fixture).querySelector('#default-content tamu-gisc-textbox input') as HTMLInputElement;

    box.value = text;
    box.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  const root = (fixture: ReturnType<typeof open>) => fixture.nativeElement as HTMLElement;
  const names = (fixture: ReturnType<typeof open>) =>
    Array.from(root(fixture).querySelectorAll('tamu-gisc-event-row .name'), (name) => name.textContent);
  const dayCards = (fixture: ReturnType<typeof open>) => root(fixture).querySelectorAll('tamu-gisc-season-day-card .card');

  it('has a search box above the sessions, and lists every session with no search', () => {
    const fixture = open();

    expect(root(fixture).querySelector('#default-content tamu-gisc-textbox')).not.toBeNull();
    expect(names(fixture)).toEqual(['Opening keynote', 'Mapathon', 'Drone flights']);
  });

  it("finds a session by its name, building, room or a presenter's name, ignoring case and accents", () => {
    const fixture = open();

    search(fixture, 'mapathon');
    expect(names(fixture)).toEqual(['Mapathon']);

    search(fixture, 'rudder');
    expect(names(fixture)).toEqual(['Opening keynote', 'Drone flights']);

    search(fixture, '204');
    expect(names(fixture)).toEqual(['Mapathon']);

    search(fixture, 'jose ortiz');
    expect(names(fixture)).toEqual(['Opening keynote']);
  });

  it('leaves out a day with no matching session', () => {
    const fixture = open();

    search(fixture, 'drone');

    expect(dayCards(fixture)).toHaveLength(1);
    expect(names(fixture)).toEqual(['Drone flights']);
  });

  it('narrows alongside the Tags filter, not instead of it', () => {
    const fixture = open();

    fixture.componentInstance.form.patchValue({ tags: ['t-1'] });
    search(fixture, 'rudder');

    expect(names(fixture)).toEqual(['Opening keynote']);
  });

  it('says no sessions match when none do, and lists them again when the search is cleared', () => {
    const fixture = open();

    search(fixture, 'zzz');

    expect(dayCards(fixture)).toHaveLength(0);
    expect(root(fixture).querySelector('.no-sessions-match')?.textContent.trim()).toBe('No sessions match "zzz".');

    search(fixture, '');

    expect(root(fixture).querySelector('.no-sessions-match')).toBeNull();
    expect(names(fixture)).toEqual(['Opening keynote', 'Mapathon', 'Drone flights']);
  });
});
