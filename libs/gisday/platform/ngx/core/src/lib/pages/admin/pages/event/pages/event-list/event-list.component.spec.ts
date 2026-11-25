import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { EventService, SeasonService, SessionFilesService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { GISDAY_SITES, type GisdaySite } from '@tamu-gisc/gisday/common';
import { GISDAY_SITE } from '@tamu-gisc/gisday/platform/ngx/common';

import { EventListComponent } from './event-list.component';

/**
 * Regression coverage (#2092). An event's "Event active?" decides whether it is on the public schedule, but
 * it could only be changed by opening each event. The admin Events list now shows it and switches it, one
 * event or every selected one, through an endpoint that changes nothing else.
 */
describe('EventListComponent', () => {
  const events = [
    { guid: 'e-on', name: 'Keynote', active: true },
    { guid: 'e-off', name: 'TBD Industry Presentation', active: false }
  ];

  function open(list: Array<object> = events) {
    const service = {
      getEntities: () => of(list),
      getEntitiesForActiveSeason: () => of(list),
      getEntitiesForSeason: () => of(list),
      setActive: vi.fn((guids: Array<string>) => of({ updated: guids.length }))
    };

    TestBed.configureTestingModule({
      imports: [EventListComponent],
      providers: [
        provideRouter([]),
        { provide: EventService, useValue: service },
        { provide: SeasonService, useValue: { seasons$: of([]), activeSeason$: of(null) } },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: {} }, queryParams: of({}) } },
        { provide: ModalService, useValue: {} },
        { provide: NotificationService, useValue: { toast: vi.fn() } },
        { provide: SessionFilesService, useValue: { forSeason: () => of([]) } }
      ]
    });

    const fixture = TestBed.createComponent(EventListComponent);
    fixture.detectChanges();

    return { fixture, service, page: fixture.nativeElement as HTMLElement };
  }

  const activeBoxes = (page: HTMLElement) => [...page.querySelectorAll('td.event-active tamu-gisc-checkbox')];

  // #2943. Each day is headed as the public Sessions page heads it, with its day of the week, in Central time.
  it('heads each day with its day of the week, as the Sessions page does', () => {
    const { page } = open([
      { guid: 'e-1', name: 'Workshop', active: true, day: { guid: 'd-1', date: '2026-11-16T06:00:00.000Z' } }
    ]);

    expect(page.querySelector('.card h2').textContent.trim()).toBe('Monday, November 16');
  });

  it('shows whether each event is on the public schedule', () => {
    const { page } = open();
    const boxes = activeBoxes(page);

    expect(boxes).toHaveLength(2);
    // The shared checkbox shows its state as an icon.
    expect(boxes.map((b) => b.querySelector('.icon-container i')?.textContent?.trim())).toEqual([
      'check_box',
      'check_box_outline_blank'
    ]);
  });

  it('switches one event from the list, without opening it', async () => {
    const { fixture, service } = open();

    await fixture.componentInstance.setActive(['e-on'], false);

    expect(service.setActive).toHaveBeenCalledWith(['e-on'], false);
  });

  it('switches every selected event at once', async () => {
    const { fixture, service } = open();

    fixture.componentInstance.toggleRow('e-on');
    fixture.componentInstance.toggleRow('e-off');
    await fixture.componentInstance.setSelectedActive(true);

    expect(service.setActive).toHaveBeenCalledWith(['e-on', 'e-off'], true);
  });

  // #3049. A search or filter that hides every session no longer reads as a season with none, and can be cleared.
  describe('with nothing shown', () => {
    const shown = (page: HTMLElement) => page.querySelectorAll('tr.selectable').length;

    it('says the search hides every session, with a button that clears it', () => {
      const { fixture, page } = open();

      fixture.componentInstance.search.setValue('no such session');
      fixture.detectChanges();

      expect(page.textContent).toContain('No sessions match the search or filters.');
      expect(page.textContent).not.toContain('There are no events for the selected season.');

      (page.querySelector('button.clear-filters') as HTMLButtonElement).click();
      fixture.detectChanges();

      expect(fixture.componentInstance.search.value).toBe('');
      expect(shown(page)).toBe(2);
    });

    it('still says a season with no sessions has none, with nothing to clear', () => {
      const { page } = open([]);

      expect(page.textContent).toContain('There are no events for the selected season.');
      expect(page.textContent).not.toContain('No sessions match');
      expect(page.querySelector('button.clear-filters')).toBeNull();
    });
  });
});

/**
 * #2986. gisday.tamu.edu shares txgisday.org's database, and its admin Sessions list showed Texas State's sessions. It
 * now starts with Texas A&M's, and a switch shows every organization's.
 */
describe('EventListComponent on gisday.tamu.edu', () => {
  const at = (guid: string, name: string, place: string) => ({
    guid,
    name,
    active: true,
    location: {
      building: 'B',
      place: { guid: place, name: place === 'tamu' ? 'Texas A&M University GIS Day(s)' : 'Texas State University GIS Day' }
    }
  });
  const events = [at('e-tamu', 'Keynote', 'tamu'), at('e-txst', 'Coffee & Networking', 'txst')];

  function open(site: GisdaySite = GISDAY_SITES.tamu) {
    TestBed.configureTestingModule({
      imports: [EventListComponent],
      providers: [
        provideRouter([]),
        { provide: GISDAY_SITE, useValue: site },
        {
          provide: EventService,
          useValue: {
            getEntities: () => of(events),
            getEntitiesForActiveSeason: () => of(events),
            getEntitiesForSeason: () => of(events)
          }
        },
        { provide: SeasonService, useValue: { seasons$: of([]), activeSeason$: of(null) } },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: {} }, queryParams: of({}) } },
        { provide: ModalService, useValue: {} },
        { provide: NotificationService, useValue: { toast: vi.fn() } },
        { provide: SessionFilesService, useValue: { forSeason: () => of([]) } }
      ]
    });

    const fixture = TestBed.createComponent(EventListComponent);
    fixture.detectChanges();

    const names = () => {
      fixture.detectChanges();

      return [...(fixture.nativeElement as HTMLElement).querySelectorAll('tr.selectable')].map((row) =>
        row.textContent.trim()
      );
    };

    return { fixture, names };
  }

  it("starts with Texas A&M's sessions only", () => {
    const { names } = open();

    expect(names().join('|')).toContain('Keynote');
    expect(names().join('|')).not.toContain('Coffee & Networking');
  });

  it("shows every organization's sessions when switched", () => {
    const { fixture, names } = open();

    fixture.componentInstance.organizations.setValue('all');

    expect(names().join('|')).toContain('Coffee & Networking');
  });

  // #3049. Every session of the season was another organization's, so the switch hid them all, and the list said the
  // season had none.
  it('says the switch hides every session, rather than that the season has none', () => {
    TestBed.configureTestingModule({
      imports: [EventListComponent],
      providers: [
        provideRouter([]),
        { provide: GISDAY_SITE, useValue: GISDAY_SITES.tamu },
        {
          provide: EventService,
          useValue: {
            getEntities: () => of([events[1]]),
            getEntitiesForActiveSeason: () => of([events[1]]),
            getEntitiesForSeason: () => of([events[1]])
          }
        },
        { provide: SeasonService, useValue: { seasons$: of([]), activeSeason$: of(null) } },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: {} }, queryParams: of({}) } },
        { provide: ModalService, useValue: {} },
        { provide: NotificationService, useValue: { toast: vi.fn() } },
        { provide: SessionFilesService, useValue: { forSeason: () => of([]) } }
      ]
    });

    const fixture = TestBed.createComponent(EventListComponent);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent;

    expect(text).toContain('No sessions match the search or filters.');
    expect(text).not.toContain('There are no events for the selected season.');
  });

  it("lists every organization's sessions on txgisday.org, with no switch", () => {
    const { fixture, names } = open(GISDAY_SITES.txgisday);

    expect(names().join('|')).toContain('Coffee & Networking');
    expect((fixture.nativeElement as HTMLElement).textContent).not.toContain("Show every organization's sessions");
  });
});

/** #3034: the sessions with no tags, in one step, so they can be given some; the list shrinks as they are. */
describe('EventListComponent, the sessions with no tags', () => {
  const events = [
    { guid: 'e-tagged', name: 'Keynote', active: true, tags: [{ guid: 't-1', name: 'Keynote' }] },
    { guid: 'e-bare', name: 'Mapathon', active: true, tags: [] },
    { guid: 'e-unset', name: 'Drone flights', active: true }
  ];

  function open() {
    TestBed.configureTestingModule({
      imports: [EventListComponent],
      providers: [
        provideRouter([]),
        { provide: GISDAY_SITE, useValue: GISDAY_SITES.txgisday },
        {
          provide: EventService,
          useValue: {
            getEntities: () => of(events),
            getEntitiesForActiveSeason: () => of(events),
            getEntitiesForSeason: () => of(events)
          }
        },
        { provide: SeasonService, useValue: { seasons$: of([]), activeSeason$: of(null) } },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: {} }, queryParams: of({}) } },
        { provide: ModalService, useValue: {} },
        { provide: NotificationService, useValue: { toast: vi.fn() } },
        { provide: SessionFilesService, useValue: { forSeason: () => of([]) } }
      ]
    });

    const fixture = TestBed.createComponent(EventListComponent);
    fixture.detectChanges();

    const names = () => {
      fixture.detectChanges();

      return [...(fixture.nativeElement as HTMLElement).querySelectorAll('tr.selectable')].map((row) =>
        row.textContent.trim()
      );
    };

    return { fixture, names };
  }

  it('offers "No tags", which lists only the sessions with none, and every one again when unticked', () => {
    const { fixture, names } = open();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Only sessions with no tags');
    expect(names()).toHaveLength(3);

    fixture.componentInstance.tagged.setValue('none');

    expect(names().join('|')).toContain('Mapathon');
    expect(names().join('|')).toContain('Drone flights');
    expect(names().join('|')).not.toContain('Keynote');

    fixture.componentInstance.tagged.setValue('');

    expect(names()).toHaveLength(3);
  });
});

/**
 * #3093: the season's sessions with and without slides, uploaded by their speakers from their edit links. The Slides
 * column says which have them and when; "Only sessions with no slides" lists those still to come, as the tags filter does.
 */
describe('EventListComponent, the sessions with and without slides (#3093)', () => {
  const events = [
    { guid: 'e-slides', name: 'Keynote', active: true },
    { guid: 'e-none', name: 'Mapathon', active: true }
  ];
  const season = { guid: 'season-2026', year: 2026 };

  function open() {
    const sessionFiles = {
      forSeason: vi.fn(() =>
        of([
          { event: 'e-slides', file: { guid: 'f-1', name: 'keynote.pdf', size: 10, uploaded: '2026-11-15T18:00:00.000Z' } }
        ])
      )
    };

    TestBed.configureTestingModule({
      imports: [EventListComponent],
      providers: [
        provideRouter([]),
        { provide: GISDAY_SITE, useValue: GISDAY_SITES.txgisday },
        {
          provide: EventService,
          useValue: {
            getEntities: () => of(events),
            getEntitiesForActiveSeason: () => of(events),
            getEntitiesForSeason: () => of(events)
          }
        },
        { provide: SeasonService, useValue: { seasons$: of([season]), activeSeason$: of(season) } },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: {} }, queryParams: of({}) } },
        { provide: ModalService, useValue: {} },
        { provide: NotificationService, useValue: { toast: vi.fn() } },
        { provide: SessionFilesService, useValue: sessionFiles }
      ]
    });

    const fixture = TestBed.createComponent(EventListComponent);
    fixture.detectChanges();

    const rows = () => {
      fixture.detectChanges();

      return [...(fixture.nativeElement as HTMLElement).querySelectorAll('tr.selectable')].map((row) => ({
        name: row.querySelectorAll('td')[1].textContent.trim(),
        slides: row.querySelector('td.event-slides')?.textContent.trim(),
        title: row.querySelector('td.event-slides span')?.getAttribute('title') ?? null
      }));
    };

    return { fixture, rows, sessionFiles };
  }

  it("shows each session's slides for the selected season: when, with the file's name, or None", () => {
    const { fixture, rows, sessionFiles } = open();

    expect(sessionFiles.forSeason).toHaveBeenCalledWith('season-2026');
    expect((fixture.nativeElement as HTMLElement).querySelector('thead').textContent).toContain('Slides');
    expect(rows()).toEqual([
      { name: 'Keynote', slides: 'Nov 15', title: 'keynote.pdf' },
      { name: 'Mapathon', slides: 'None', title: null }
    ]);
  });

  it('offers "Only sessions with no slides", which lists the sessions still without, and every one again when unticked', () => {
    const { fixture, rows } = open();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Only sessions with no slides');

    fixture.componentInstance.withSlides.setValue('none');

    expect(rows().map((r) => r.name)).toEqual(['Mapathon']);

    fixture.componentInstance.withSlides.setValue('');

    expect(rows().map((r) => r.name)).toEqual(['Keynote', 'Mapathon']);
  });
});

/**
 * #434: on txgisday.org the Events list holds every organization's sessions, a long list to find one organization's in.
 * An Organization choice lists only the sessions at that organization's venues, and is put back with the other filters.
 * Red on today's code.
 */
describe("EventListComponent, one organization's sessions (#434)", () => {
  const esri = { guid: 'p-esri', name: 'Esri' };
  const tamu = { guid: 'p-tamu', name: 'Texas A&M University' };
  const events = [
    { guid: 'e-1', name: 'Map clinic', active: true, location: { building: 'ILSB', place: tamu } },
    { guid: 'e-2', name: 'Imagery workshop', active: true, location: { building: 'Online', place: esri } },
    { guid: 'e-3', name: 'Campus walk', active: true, location: { building: 'MSC', place: tamu } },
    { guid: 'e-4', name: 'Unplaced talk', active: true }
  ];

  /** The page as this test reads it: its Organization choice and the choices it offers. */
  type Page = {
    organization: { setValue(value: string): void; value: string };
    organizationChoices$: import('rxjs').Observable<Array<{ guid: string; name: string }>>;
    clearFilters(): void;
  };

  function open() {
    TestBed.configureTestingModule({
      imports: [EventListComponent],
      providers: [
        provideRouter([]),
        { provide: GISDAY_SITE, useValue: GISDAY_SITES.txgisday },
        {
          provide: EventService,
          useValue: {
            getEntities: () => of(events),
            getEntitiesForActiveSeason: () => of(events),
            getEntitiesForSeason: () => of(events)
          }
        },
        { provide: SeasonService, useValue: { seasons$: of([]), activeSeason$: of(null) } },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: {} }, queryParams: of({}) } },
        { provide: ModalService, useValue: {} },
        { provide: NotificationService, useValue: { toast: vi.fn() } },
        { provide: SessionFilesService, useValue: { forSeason: () => of([]) } }
      ]
    });

    const fixture = TestBed.createComponent(EventListComponent);
    fixture.detectChanges();

    const names = () => {
      fixture.detectChanges();

      return [...(fixture.nativeElement as HTMLElement).querySelectorAll('tr.selectable')].map((row) =>
        row.textContent.trim()
      );
    };

    return { fixture, names, page: fixture.componentInstance as unknown as Page };
  }

  it("offers the organizations of the season's sessions, by name, after every organization", async () => {
    const { fixture, page } = open();
    let choices: Array<{ guid: string; name: string }> = [];
    page.organizationChoices$.subscribe((c) => (choices = c));

    expect(choices).toEqual([{ guid: '', name: 'Every organization' }, esri, tamu]);
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('tamu-gisc-select[placeholder="Organization"]')
    ).not.toBeNull();
  });

  it("lists only the chosen organization's sessions, and every one again when cleared", () => {
    const { names, page } = open();

    expect(names()).toHaveLength(4);

    page.organization.setValue('p-tamu');

    expect(names().join('|')).toContain('Map clinic');
    expect(names().join('|')).toContain('Campus walk');
    expect(names().join('|')).not.toContain('Imagery workshop');
    expect(names().join('|')).not.toContain('Unplaced talk');

    page.clearFilters();

    expect(page.organization.value).toBe('');
    expect(names()).toHaveLength(4);
  });
});
