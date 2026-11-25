import type { MockInstance } from 'vitest';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
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

import { LinkedSearchComponent } from '@tamu-gisc/gisday/platform/ngx/common';

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

  let navigate: MockInstance;

  function open(searched: string | null = null) {
    TestBed.configureTestingModule({
      imports: [EventViewComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: convertToParamMap(searched ? { search: searched } : {}) }, queryParams: of({}), fragment: of(null) }
        },
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
    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
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

  it("clears the search from the shared textbox's x, listing every session again (#2963)", () => {
    const fixture = open();
    const clear = () =>
      root(fixture).querySelector('#default-content tamu-gisc-textbox button[aria-label="Clear the search"]') as HTMLButtonElement;

    expect(clear()).toBeNull();
    search(fixture, 'mapathon');
    expect(names(fixture)).toEqual(['Mapathon']);

    clear().click();
    fixture.detectChanges();

    expect(fixture.componentInstance.search.value).toBe('');
    expect(clear()).toBeNull();
    expect(names(fixture)).toEqual(['Opening keynote', 'Mapathon', 'Drone flights']);
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

  /** #3027: the search can be linked to, as the Presenters page's can (#2919, #2921), by the same shared piece. */
  describe('as a link (#3027)', () => {
    const copyButton = (fixture: ReturnType<typeof open>) =>
      root(fixture).querySelector('#default-content tamu-gisc-textbox .copy-button') as HTMLElement;

    it('opens already searched from its address, with the copy button', () => {
      const fixture = open('rudder');

      expect(fixture.componentInstance.search.value).toBe('rudder');
      expect(names(fixture)).toEqual(['Opening keynote', 'Drone flights']);
      expect(copyButton(fixture).textContent).toContain('Copy link');
    });

    it('shows no copy button with no search', () => {
      expect(copyButton(open())).toBeNull();
    });

    it('keeps the address in step with the box, replacing the history entry and keeping the filters', fakeAsync(() => {
      const fixture = open();

      search(fixture, 'drone');
      tick(300);

      // Merged, so the Tags and Organizations filters' tags and orgs stay in the address beside it.
      expect(navigate).toHaveBeenLastCalledWith(
        [],
        expect.objectContaining({ queryParams: { search: 'drone' }, replaceUrl: true, queryParamsHandling: 'merge' })
      );
    }));

    it('copies the whole link, ready to paste into an email', () => {
      const fixture = open('drone flights');
      const linked = fixture.debugElement.query(By.directive(LinkedSearchComponent)).componentInstance as LinkedSearchComponent;

      expect(linked.link()).toBe(`${window.location.origin}/?search=drone%20flights`);
    });
  });
});
