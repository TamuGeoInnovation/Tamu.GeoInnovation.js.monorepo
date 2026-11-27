import type { Mock } from 'vitest';
import { ChangeDetectorRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { NEVER, Observable, firstValueFrom, of } from 'rxjs';

import {
  BroadcastService,
  EventService,
  JudgingService,
  LocationService,
  SeasonService,
  SpeakerEditsService,
  SessionFilesService,
  SpeakerService,
  TagService
} from '@tamu-gisc/gisday/platform/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { GISDAY_SITES, GisdaySite } from '@tamu-gisc/gisday/common';

import { GISDAY_SITE } from '../../../../../site/site';
import { EventAddEditFormComponent } from './event-add-edit-form.component';
import { ReviewEmailModalComponent } from '../../../../modals/review-email-modal/review-email-modal.component';

/** The judging routes as the form reads them (#3183): a session with no judging yet. */
function judgingService(judging: object = { judgedCompetition: null, judgingClosed: false, judges: [] }) {
  return { eventJudging: vi.fn(() => of(judging)) };
}

/**
 * #2706. "Is accepting RSVPs?" starts ticked on a new event, as the database column's default is, so an event made in the
 * admin pages accepts RSVPs unless the organizer unticks it. On 6 November 2026 every one of the 45 active events on each
 * site had been saved with it off.
 */
describe('EventAddEditFormComponent', () => {
  let speakerEdits: { preview: Mock; send: Mock };
  let modals: { open: Mock };

  function create(type: 'create' | 'edit', event?: object, seasonSpeakers: Array<object> = [], days: Array<object> = []) {
    speakerEdits = { preview: vi.fn(() => of({ groups: [] })), send: vi.fn(() => of({ sent: [], skipped: [] })) };
    modals = { open: vi.fn(() => of({ profile: 'Hi {edit link}', 'profile:subject': 'Profile' })) };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { params: of({ guid: 'event' }) } },
        { provide: SeasonService, useValue: { activeSeason$: of({ guid: 'season', days }) } },
        { provide: SpeakerService, useValue: { getEntitiesForActiveSeason: () => of(seasonSpeakers) } },
        { provide: TagService, useValue: { getEntitiesForActiveSeason: () => of([]) } },
        { provide: LocationService, useValue: { getEntitiesForActiveSeason: () => of([]) } },
        { provide: BroadcastService, useValue: { getEntitiesForActiveSeason: () => of([]) } },
        { provide: EventService, useValue: { getEntity: () => of(event), getEventAttendance: () => NEVER } },
        { provide: NotificationService, useValue: { toast: vi.fn() } },
        { provide: SpeakerEditsService, useValue: speakerEdits },
        { provide: SessionFilesService, useValue: { forEvent: () => of([]) } },
        { provide: JudgingService, useValue: judgingService() },
        { provide: ModalService, useValue: modals }
      ]
    });
    // The form's own setup is what is under test, not its template.
    TestBed.overrideTemplate(EventAddEditFormComponent, '');

    const fixture = TestBed.createComponent(EventAddEditFormComponent);
    fixture.componentRef.setInput('type', type);
    fixture.componentInstance.ngOnInit();

    return fixture.componentInstance;
  }

  it('starts a new event accepting RSVPs, as the database does', () => {
    expect(create('create').form.getRawValue().isAcceptingRsvps).toBe(true);
  });

  it('keeps what an existing event has', () => {
    const form = create('edit', { guid: 'event', name: 'A workshop', isAcceptingRsvps: false, speakers: [], tags: [] }).form;

    expect(form.getRawValue().isAcceptingRsvps).toBe(false);
  });

  /** #2940. An event's speakers, on its edit page, by last name and then first name, not in the order they were added. */
  describe("the event's speakers", () => {
    const person = (guid: string, firstName: string, lastName: string) => ({ guid, firstName, lastName });
    const zheng = person('1', 'Sunny', 'Zheng');
    const ablack = person('2', 'Ethan', 'Ablack');
    const beaneB = person('3', 'Brooke', 'Beane');
    const beaneA = person('4', 'Alex', 'Beane');
    const names = (speakers: Array<{ firstName?: string; lastName?: string }>) =>
      speakers.map((s) => `${s.firstName} ${s.lastName}`);

    it('are listed by last name, then first name, when the page opens', async () => {
      const form = create('edit', { guid: 'event', speakers: [zheng, beaneB, ablack, beaneA], tags: [] });

      expect(names(await firstValueFrom(form.eventSpeakers$))).toEqual([
        'Ethan Ablack',
        'Alex Beane',
        'Brooke Beane',
        'Sunny Zheng'
      ]);
    });

    it('stay in that order when one is added', () => {
      const form = create('edit', { guid: 'event', speakers: [zheng], tags: [] }, [zheng, ablack]);
      const shown: Array<Array<{ firstName?: string; lastName?: string }>> = [];
      const watching = form.eventSpeakers$.subscribe((speakers) => shown.push(speakers));

      form.patchSpeaker(ablack, 'add');
      watching.unsubscribe();

      expect(names(shown[shown.length - 1])).toEqual(['Ethan Ablack', 'Sunny Zheng']);
    });
  });

  /**
   * #3574. SeasonService and EventService hand the form each day's date as a Date (#3558), so the form uses it as it
   * comes rather than wrapping it again.
   */
  describe("a day's date", () => {
    const monday = { guid: 'day-mon', date: new Date('2026-11-16T06:00:00.000Z') };

    it("is the Date each of the active season's days came with", async () => {
      const days = await firstValueFrom(create('create', undefined, [], [monday]).activeSeasonDays$);

      expect(days).toEqual([{ guid: 'day-mon', date: monday.date }]);
      expect(days[0].date).toBeInstanceOf(Date);
    });

    it("gives an edited session's start and end on its day, and keeps its stored times", async () => {
      const form = create(
        'edit',
        { guid: 'event', day: monday, startTime: '14:00:00', endTime: '14:40:00', speakers: [], tags: [] },
        [],
        [monday]
      );
      const start = await firstValueFrom(form.selectedEventDateStart$);

      expect(start).toEqual(new Date(`${monday.date.toDateString()} 14:00:00`));
      expect(form.form.getRawValue().startTime).toBe('14:00:00');
      expect(form.form.getRawValue().endTime).toBe('14:40:00');
    });

    it("opens a session with no stored time on its day's own time", async () => {
      const form = create(
        'edit',
        { guid: 'event', day: monday, startTime: null, endTime: null, speakers: [], tags: [] },
        [],
        [monday]
      );

      const start = firstValueFrom(form.selectedEventDateStart$);

      // The default follows the day chosen in the form.
      form.form.patchValue({ day: 'day-mon' });

      expect(await start).toBe(monday.date);
    });
  });
});

/** #3023: the event's own "Email speakers their edit links" shows the email first, editable, as the other two places do. */
describe('EventAddEditFormComponent, the profile email', () => {
  it("shows the email for the event's speakers first, then sends it as edited", () => {
    const speakerEdits = { preview: vi.fn(() => of({ groups: [] })), send: vi.fn(() => of({ sent: [], skipped: [] })) };
    const modals = { open: vi.fn(() => of({ profile: 'Hi {edit link}', 'profile:subject': 'Profile' })) };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { params: of({ guid: 'event' }) } },
        { provide: SeasonService, useValue: { activeSeason$: of({ guid: 'season', days: [] }) } },
        { provide: SpeakerService, useValue: { getEntitiesForActiveSeason: () => of([]) } },
        { provide: TagService, useValue: { getEntitiesForActiveSeason: () => of([]) } },
        { provide: LocationService, useValue: { getEntitiesForActiveSeason: () => of([]) } },
        { provide: BroadcastService, useValue: { getEntitiesForActiveSeason: () => of([]) } },
        {
          provide: EventService,
          useValue: {
            getEventAttendance: () => NEVER,
            getEntity: () =>
              of({
                guid: 'event',
                speakers: [
                  { guid: 'sp-1', lastName: 'Abe' },
                  { guid: 'sp-2', lastName: 'Bo' }
                ]
              })
          }
        },
        { provide: NotificationService, useValue: { toast: vi.fn() } },
        { provide: SpeakerEditsService, useValue: speakerEdits },
        { provide: SessionFilesService, useValue: { forEvent: () => of([]) } },
        { provide: JudgingService, useValue: judgingService() },
        { provide: ModalService, useValue: modals }
      ]
    });
    TestBed.overrideTemplate(EventAddEditFormComponent, '');

    const fixture = TestBed.createComponent(EventAddEditFormComponent);
    fixture.componentRef.setInput('type', 'edit');
    fixture.componentInstance.ngOnInit();
    fixture.componentInstance.emailSpeakersEditLinks();

    expect(modals.open).toHaveBeenCalledWith(
      ReviewEmailModalComponent,
      expect.objectContaining({ data: expect.objectContaining({ verb: 'Send profile email', editableSubject: true }) })
    );
    expect(speakerEdits.preview).toHaveBeenCalledWith(['sp-1', 'sp-2']);
    expect(speakerEdits.send).toHaveBeenCalledWith(['sp-1', 'sp-2'], { subject: 'Profile', template: 'Hi {edit link}' });
  });
});

/**
 * #3048. An event's Broadcast drop-down on gisday.tamu.edu listed every organization's Zooms, so another university's
 * could be picked for a Texas A&M session by mistake. It lists the site's own, those with no place yet, and the one the
 * event already has, whoever's it is, so opening an event never drops its broadcast.
 */
describe('EventAddEditFormComponent, the Broadcast drop-down', () => {
  const tamu = { guid: 'tamu', name: 'Texas A&M University GIS Day(s)' };
  const ttu = { guid: 'ttu', name: 'Texas Tech University GIS Day' };
  const broadcasts = [
    { guid: 'b-tamu', name: 'TAMU Zoom 1', place: tamu },
    { guid: 'b-ttu', name: 'TTU 1', place: ttu },
    { guid: 'b-ttu-2', name: 'TTU 2', place: ttu },
    { guid: 'b-none', name: 'Unplaced Zoom', place: null }
  ];

  async function listed(site: GisdaySite, type: 'create' | 'edit', event?: object) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: GISDAY_SITE, useValue: site },
        { provide: ActivatedRoute, useValue: { params: of({ guid: 'event' }) } },
        { provide: SeasonService, useValue: { activeSeason$: of({ guid: 'season', days: [] }) } },
        { provide: SpeakerService, useValue: { getEntitiesForActiveSeason: () => of([]) } },
        { provide: TagService, useValue: { getEntitiesForActiveSeason: () => of([]) } },
        { provide: LocationService, useValue: { getEntitiesForActiveSeason: () => of([]) } },
        { provide: BroadcastService, useValue: { getEntitiesForActiveSeason: () => of(broadcasts) } },
        { provide: EventService, useValue: { getEntity: () => of(event), getEventAttendance: () => NEVER } },
        { provide: NotificationService, useValue: { toast: vi.fn() } },
        { provide: SpeakerEditsService, useValue: {} },
        { provide: SessionFilesService, useValue: { forEvent: () => of([]) } },
        { provide: JudgingService, useValue: judgingService() },
        { provide: ModalService, useValue: {} }
      ]
    });
    TestBed.overrideTemplate(EventAddEditFormComponent, '');

    const fixture = TestBed.createComponent(EventAddEditFormComponent);
    fixture.componentRef.setInput('type', type);
    fixture.componentInstance.ngOnInit();

    return (await firstValueFrom(fixture.componentInstance.broadcasts$)).map((b) => b.name);
  }

  it("lists only the site's own broadcasts on gisday.tamu.edu, and those with no place yet", async () => {
    expect(await listed(GISDAY_SITES.tamu, 'create')).toEqual(['TAMU Zoom 1', 'Unplaced Zoom']);
  });

  it("keeps the event's own broadcast, though it is another organization's", async () => {
    const event = { guid: 'event', speakers: [], tags: [], broadcast: { guid: 'b-ttu', name: 'TTU 1' } };

    expect(await listed(GISDAY_SITES.tamu, 'edit', event)).toEqual(['TAMU Zoom 1', 'TTU 1', 'Unplaced Zoom']);
  });

  it("lists every organization's broadcasts on txgisday.org", async () => {
    expect(await listed(GISDAY_SITES.txgisday, 'create')).toHaveLength(4);
  });
});

/**
 * #3092: the session's email actions are one "Email these speakers" menu, Profile email and Session details, rather than
 * buttons side by side. Session details opens the same window as the profile email, prefilled from the session. #3113
 * adds Ask for slides, in the same window.
 */
describe('EventAddEditFormComponent, the Email these speakers menu', () => {
  const event = {
    guid: 'event',
    name: 'WORKSHOP: Mapping floods',
    speakers: [
      { guid: 'sp-1', firstName: 'Ana', lastName: 'Abe' },
      { guid: 'sp-2', firstName: 'Bo', lastName: 'Bo' }
    ],
    tags: []
  };

  function render(
    closesWith: object | null = { 'session-details': 'Hi {first name}', 'session-details:subject': 'Your session' }
  ) {
    const speakerEdits = {
      preview: vi.fn(() => of({ groups: [] })),
      send: vi.fn(() => of({ sent: [], skipped: [] })),
      previewSessionDetails: vi.fn(() => of({ groups: [] })),
      sendSessionDetails: vi.fn(() => of({ sent: ['Ana Abe'], skipped: [] })),
      previewSlidesRequest: vi.fn(() => of({ groups: [] })),
      sendSlidesRequest: vi.fn(() => of({ sent: ['Bo Bo'], skipped: [] })),
      previewJudging: vi.fn(() => of({ groups: [] })),
      sendJudging: vi.fn(() => of({ sent: ['Bo Bo'], skipped: [] }))
    };
    // What the window gives back for each email, as the admin left it: the slides request with one speaker ticked, and
    // together asked for, which it never offers (#3113).
    const results: Record<string, object> = {
      'Send profile email': { profile: 'Hi {edit link}', 'profile:subject': 'Profile' },
      'Send slides request': {
        'slides-request': 'Upload: {edit link}',
        'slides-request:subject': 'Slides',
        ':recipients': 'sp-2',
        ':together': 'true'
      },
      // #3183: the Ask to judge email, one judge ticked, together asked for, which it never offers either.
      'Send judging emails': {
        judging: 'Score here: {judging link}',
        'judging:subject': 'Judging',
        ':recipients': 'sp-2',
        ':together': 'true'
      }
    };
    const modals = {
      open: vi.fn((_component: unknown, options: { data: { verb: string } }) =>
        of(closesWith && results[options.data.verb] ? results[options.data.verb] : closesWith)
      )
    };
    const toasts = { toast: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { params: of({ guid: 'event' }) } },
        { provide: SeasonService, useValue: { activeSeason$: of({ guid: 'season', days: [] }) } },
        { provide: SpeakerService, useValue: { getEntitiesForActiveSeason: () => of(event.speakers) } },
        { provide: TagService, useValue: { getEntitiesForActiveSeason: () => of([]) } },
        { provide: LocationService, useValue: { getEntitiesForActiveSeason: () => of([]) } },
        { provide: BroadcastService, useValue: { getEntitiesForActiveSeason: () => of([]) } },
        { provide: EventService, useValue: { getEntity: () => of(event), getEventAttendance: () => NEVER } },
        { provide: NotificationService, useValue: toasts },
        { provide: SpeakerEditsService, useValue: speakerEdits },
        { provide: SessionFilesService, useValue: { forEvent: () => of([]) } },
        { provide: JudgingService, useValue: judgingService() },
        { provide: ModalService, useValue: modals }
      ]
    });
    // Only the Speakers section's toolbar, as the page draws it: the rest of the form is not under test.
    TestBed.overrideTemplate(EventAddEditFormComponent, speakersToolbar());

    const fixture = TestBed.createComponent(EventAddEditFormComponent);
    fixture.componentRef.setInput('type', 'edit');
    fixture.detectChanges();

    const page = fixture.nativeElement as HTMLElement;
    const choose = (label: string) => {
      page.querySelector<HTMLButtonElement>('tamu-gisc-action-menu button[aria-haspopup="menu"]').click();
      fixture.detectChanges();
      Array.from(page.querySelectorAll<HTMLElement>('[role="menuitem"]'))
        .find((item) => item.textContent.trim() === label)
        .click();
      fixture.detectChanges();
    };
    // Sets a field as a person would. Their tick or choice is a template event, which marks the form for checking;
    // a value set from code is not, so the zoneless TestBed (#1977) is told, as the control's own event would tell it.
    const set = (name: string, value: unknown) => {
      fixture.componentInstance.form.get(name).setValue(value);
      fixture.debugElement.injector.get(ChangeDetectorRef).markForCheck();
      fixture.detectChanges();
    };

    return { page, fixture, speakerEdits, modals, toasts, choose, set };
  }

  it('shows one Email these speakers menu with Profile email, Session details and Ask for slides, and no separate email buttons', () => {
    const { page, fixture } = render();
    const toolbar = page.querySelector('.form-section-actions');

    expect(toolbar).not.toBeNull();
    expect(toolbar.querySelectorAll('tamu-gisc-action-menu')).toHaveLength(1);
    expect(toolbar.textContent).toContain('Email these speakers');
    expect(toolbar.textContent).not.toContain('Send profile emails to these speakers');
    expect(toolbar.querySelectorAll('a')).toHaveLength(0);

    toolbar.querySelector<HTMLButtonElement>('button[aria-haspopup="menu"]').click();
    fixture.detectChanges();

    expect(Array.from(toolbar.querySelectorAll('[role="menuitem"]')).map((i) => i.textContent.trim())).toEqual([
      'Profile email',
      'Session details',
      'Ask for slides'
    ]);
  });

  // #3147: a panel, a social or lunch has no slides, so nobody on it is asked for any.
  it('offers no Ask for slides while No slides for this session is ticked, and offers it again once unticked', () => {
    const { page, fixture, set } = render();
    const items = () => {
      page.querySelector<HTMLButtonElement>('tamu-gisc-action-menu button[aria-haspopup="menu"]').click();
      fixture.detectChanges();
      const labels = Array.from(page.querySelectorAll('[role="menuitem"]')).map((i) => i.textContent.trim());
      page.querySelector<HTMLButtonElement>('tamu-gisc-action-menu button[aria-haspopup="menu"]').click();
      fixture.detectChanges();
      return labels;
    };

    set('noSlides', true);
    expect(items()).toEqual(['Profile email', 'Session details']);

    set('noSlides', false);
    expect(items()).toEqual(['Profile email', 'Session details', 'Ask for slides']);
  });

  it('asks for slides in the same window, editable, then sends it for this session to the speakers ticked, a copy each', () => {
    const { speakerEdits, modals, toasts, choose } = render();

    choose('Ask for slides');

    expect(modals.open).toHaveBeenCalledWith(
      ReviewEmailModalComponent,
      expect.objectContaining({ data: expect.objectContaining({ verb: 'Send slides request', editableSubject: true }) })
    );
    expect(speakerEdits.previewSlidesRequest).toHaveBeenCalledWith('event');
    expect(speakerEdits.sendSlidesRequest).toHaveBeenCalledWith('event', {
      subject: 'Slides',
      template: 'Upload: {edit link}',
      speakers: ['sp-2']
    });
    expect(speakerEdits.sendSessionDetails).not.toHaveBeenCalled();
    expect(speakerEdits.send).not.toHaveBeenCalled();
    expect(toasts.toast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Slides requested' }));
  });

  // #3183: Ask to judge goes to the session's judges, so it is offered only once the session judges a competition.
  it('offers Ask to judge only while a judged competition is chosen', () => {
    const { page, fixture, set } = render();
    const items = () => {
      page.querySelector<HTMLButtonElement>('tamu-gisc-action-menu button[aria-haspopup="menu"]').click();
      fixture.detectChanges();
      const labels = Array.from(page.querySelectorAll('[role="menuitem"]')).map((i) => i.textContent.trim());
      page.querySelector<HTMLButtonElement>('tamu-gisc-action-menu button[aria-haspopup="menu"]').click();
      fixture.detectChanges();
      return labels;
    };

    expect(items()).not.toContain('Ask to judge');

    set('judgedCompetition', 'graduate-poster');
    expect(items()).toEqual(['Profile email', 'Session details', 'Ask for slides', 'Ask to judge']);

    set('judgedCompetition', '');
    expect(items()).not.toContain('Ask to judge');
  });

  it("asks the session's judges in the same window, editable, then sends it to the judges ticked, a copy each", () => {
    const { speakerEdits, modals, toasts, choose, set } = render();

    set('judgedCompetition', 'graduate-poster');
    choose('Ask to judge');

    expect(modals.open).toHaveBeenCalledWith(
      ReviewEmailModalComponent,
      expect.objectContaining({ data: expect.objectContaining({ verb: 'Send judging emails', editableSubject: true }) })
    );
    expect(speakerEdits.previewJudging).toHaveBeenCalledWith('event');
    expect(speakerEdits.sendJudging).toHaveBeenCalledWith('event', {
      subject: 'Judging',
      template: 'Score here: {judging link}',
      speakers: ['sp-2']
    });
    expect(speakerEdits.sendSlidesRequest).not.toHaveBeenCalled();
    expect(toasts.toast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Judges asked' }));
  });

  it('sends the profile email from the menu, as the button did', () => {
    const { speakerEdits, choose } = render();

    choose('Profile email');

    expect(speakerEdits.preview).toHaveBeenCalledWith(['sp-1', 'sp-2']);
    expect(speakerEdits.send).toHaveBeenCalledWith(['sp-1', 'sp-2'], { subject: 'Profile', template: 'Hi {edit link}' });
  });

  it("opens the session details in the profile email's window, editable, then sends it for this session as edited", () => {
    const { speakerEdits, modals, toasts, choose } = render();

    choose('Session details');

    expect(modals.open).toHaveBeenCalledWith(
      ReviewEmailModalComponent,
      expect.objectContaining({ data: expect.objectContaining({ verb: 'Send session details', editableSubject: true }) })
    );
    expect(speakerEdits.previewSessionDetails).toHaveBeenCalledWith('event');
    expect(speakerEdits.sendSessionDetails).toHaveBeenCalledWith('event', {
      subject: 'Your session',
      template: 'Hi {first name}'
    });
    expect(toasts.toast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Session details sent' }));
  });

  it('sends nothing when the window is cancelled', () => {
    const { speakerEdits, toasts, choose } = render(null);

    choose('Session details');

    expect(speakerEdits.sendSessionDetails).not.toHaveBeenCalled();
    expect(toasts.toast).not.toHaveBeenCalled();
  });
});

/** The Speakers section's toolbar from the page's own template, so the test draws what the page draws. */
function speakersToolbar(): string {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { readFileSync } = require('fs');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { join } = require('path');
  const html: string = readFileSync(join(__dirname, 'event-add-edit-form.component.html'), 'utf8');
  const start = html.indexOf('<div class="form-section-title">Speakers</div>');
  const end = html.indexOf('</div>\n\n    <div class="form-section-body">', start);

  return `<div class="form-section-toolbar">${html.slice(start, end)}</div>`;
}

/**
 * #3093. A session's slides, uploaded by its speakers from their edit links, on the session's admin page: every
 * speaker's, each labelled with who uploaded it, listed with a download for each, and nothing there to change them.
 */
describe('EventAddEditFormComponent, the Slides section (#3093)', () => {
  // Made-up speakers.
  const deck = {
    guid: 'f-1',
    name: 'Example watersheds.pptx',
    size: 3_300_000,
    uploaded: '2026-11-15T18:00:00.000Z',
    uploadedBy: 'Avery Example'
  };
  const theirs = { ...deck, guid: 'f-2', name: 'Lightning.pdf', size: 1024, uploadedBy: 'Blair Sample' };

  it("lists every speaker's files, each labelled with who uploaded it", () => {
    const { page } = render('edit', [deck, theirs]);

    const files = [...page.querySelectorAll('.file')].map((f) => [
      f.querySelector('.file-name').textContent.trim(),
      f.querySelector('.file-detail').textContent.replace(/\s+/g, ' ').trim()
    ]);

    expect(files).toEqual([
      ['Example watersheds.pptx', expect.stringMatching(/^Avery Example · 3\.1 MB · Nov 15/)],
      ['Lightning.pdf', expect.stringMatching(/^Blair Sample · 1 KB · Nov 15/)]
    ]);
  });

  function render(type: 'create' | 'edit', files: Array<object> = [deck]) {
    const sessionFiles = {
      forEvent: vi.fn(() => of(files)),
      download: vi.fn(() => of(new Blob(['x']))),
      removeFromEvent: vi.fn(() => of(undefined))
    };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { params: of({ guid: 'event' }) } },
        { provide: SeasonService, useValue: { activeSeason$: of({ guid: 'season', days: [] }) } },
        { provide: SpeakerService, useValue: { getEntitiesForActiveSeason: () => of([]) } },
        { provide: TagService, useValue: { getEntitiesForActiveSeason: () => of([]) } },
        { provide: LocationService, useValue: { getEntitiesForActiveSeason: () => of([]) } },
        { provide: BroadcastService, useValue: { getEntitiesForActiveSeason: () => of([]) } },
        {
          provide: EventService,
          useValue: { getEntity: () => of({ guid: 'event', speakers: [], tags: [] }), getEventAttendance: () => NEVER }
        },
        { provide: NotificationService, useValue: { toast: vi.fn() } },
        { provide: SpeakerEditsService, useValue: {} },
        { provide: SessionFilesService, useValue: sessionFiles },
        { provide: JudgingService, useValue: judgingService() },
        { provide: ModalService, useValue: {} }
      ]
    });
    // Only the Slides section, as the page draws it.
    TestBed.overrideTemplate(EventAddEditFormComponent, slidesSection());

    const fixture = TestBed.createComponent(EventAddEditFormComponent);
    fixture.componentRef.setInput('type', type);
    fixture.detectChanges();

    return { page: fixture.nativeElement as HTMLElement, sessionFiles, fixture };
  }

  it("lists the session's slides with their size and date, each a download", () => {
    const { page, sessionFiles } = render('edit');

    expect(page.querySelector('.form-section-title').textContent.trim()).toBe('Slides');
    expect(sessionFiles.forEvent).toHaveBeenCalledWith('event');

    const name = page.querySelector<HTMLButtonElement>('button.file-name');

    expect(name.textContent.trim()).toBe('Example watersheds.pptx');
    expect(page.querySelector('.file-detail').textContent).toContain('3.1 MB');

    Object.assign(URL, { createObjectURL: vi.fn(() => 'blob:deck'), revokeObjectURL: vi.fn() });
    name.click();

    expect(sessionFiles.download).toHaveBeenCalledWith('event', 'f-1');
  });

  it('offers no upload, and says when there are none', () => {
    const { page } = render('edit', []);

    expect(page.querySelector('.files-empty').textContent.trim()).toBe('No slides uploaded yet.');
    expect(page.querySelector('tamu-gisc-file')).toBeNull();
  });

  /**
   * #3105: the admins can remove any speaker's file, one whose speaker is no longer listed included, after saying so on
   * the page: the site asks there, never in the browser's own confirm().
   */
  describe('removing a file (#3105)', () => {
    const gone = { ...deck, uploadedBy: 'A speaker no longer listed' };
    const button = (page: HTMLElement, text: string) =>
      [...page.querySelectorAll<HTMLButtonElement>('button')].find((b) => b.textContent.trim() === text);

    it('asks on the page first, naming the file and who uploaded it, and removes nothing until told to', () => {
      const confirm = vi.spyOn(window, 'confirm');
      const { page, sessionFiles, fixture } = render('edit', [gone]);

      button(page, 'Remove').click();
      fixture.detectChanges();

      const asked = page.querySelector('[role="alert"]');
      expect(asked.textContent.replace(/\s+/g, ' ')).toContain(
        'Remove Example watersheds.pptx, uploaded by A speaker no longer listed? It cannot be undone.'
      );
      expect(confirm).not.toHaveBeenCalled();
      expect(sessionFiles.removeFromEvent).not.toHaveBeenCalled();
      // Side by side, in the site's shared button row (libs/sass/_dom_flexbox.scss), not one above the other.
      const row = button(page, 'Remove the file').parentElement;
      expect(row.classList).toEqual(
        expect.objectContaining({ value: 'flex flex-row wrap align-center file-confirm-actions' })
      );
      expect(button(page, 'Keep it').parentElement).toBe(row);

      button(page, 'Keep it').click();
      fixture.detectChanges();

      expect(page.querySelector('[role="alert"]')).toBeNull();
      expect(page.querySelectorAll('.file')).toHaveLength(1);
    });

    it('removes the file once told to, and takes it off the list', () => {
      const { page, sessionFiles, fixture } = render('edit', [gone, theirs]);

      button(page, 'Remove').click();
      fixture.detectChanges();
      button(page, 'Remove the file').click();
      fixture.detectChanges();

      expect(sessionFiles.removeFromEvent).toHaveBeenCalledWith('event', 'f-1');
      expect([...page.querySelectorAll('.file-name')].map((f) => f.textContent.trim())).toEqual(['Lightning.pdf']);
    });
  });

  it('has no Slides section on a new event', () => {
    expect(render('create').page.querySelector('tamu-gisc-submission-files')).toBeNull();
  });
});

/** The Slides section from the page's own template. */
function slidesSection(): string {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { readFileSync } = require('fs');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { join } = require('path');
  const html: string = readFileSync(join(__dirname, 'event-add-edit-form.component.html'), 'utf8');
  const start = html.indexOf('@if (slides(); as slides) {');
  const end = html.indexOf('<div class="form-section">', html.indexOf('<div class="form-section-title">Slides</div>'));

  return html.slice(start, end);
}

/**
 * #3183. A session's judging on its admin page: the competition its judges score, which of its speakers judge, and
 * whether judging is closed, saved with the session.
 */
describe('EventAddEditFormComponent, the Judging section (#3183)', () => {
  // Made-up speakers.
  const event = {
    guid: 'event',
    name: 'Graduate posters',
    judgedCompetition: 'graduate-poster',
    judgingClosed: false,
    speakers: [
      { guid: 'sp-1', firstName: 'Ana', lastName: 'Abe' },
      { guid: 'sp-2', firstName: 'Bo', lastName: 'Bo' }
    ],
    tags: []
  };

  function render(options: { judging?: object; site?: string; type?: 'create' | 'edit' } = {}) {
    const judging =
      (options.judging as { eventJudging: Mock }) ??
      judgingService({ judgedCompetition: 'graduate-poster', judgingClosed: false, judges: ['sp-2'] });

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { params: of({ guid: 'event' }) } },
        { provide: SeasonService, useValue: { activeSeason$: of({ guid: 'season', days: [] }) } },
        { provide: SpeakerService, useValue: { getEntitiesForActiveSeason: () => of(event.speakers) } },
        { provide: TagService, useValue: { getEntitiesForActiveSeason: () => of([]) } },
        { provide: LocationService, useValue: { getEntitiesForActiveSeason: () => of([]) } },
        { provide: BroadcastService, useValue: { getEntitiesForActiveSeason: () => of([]) } },
        { provide: EventService, useValue: { getEntity: () => of(event), getEventAttendance: () => NEVER } },
        { provide: NotificationService, useValue: { toast: vi.fn() } },
        { provide: SpeakerEditsService, useValue: {} },
        { provide: SessionFilesService, useValue: { forEvent: () => of([]) } },
        { provide: JudgingService, useValue: judging },
        { provide: ModalService, useValue: {} },
        ...(options.site ? [{ provide: GISDAY_SITE, useValue: GISDAY_SITES[options.site] as GisdaySite }] : [])
      ]
    });
    // Only the Judging section, as the page draws it.
    TestBed.overrideTemplate(EventAddEditFormComponent, judgingSection());

    const fixture = TestBed.createComponent(EventAddEditFormComponent);
    fixture.componentRef.setInput('type', options.type ?? 'edit');
    fixture.detectChanges();

    return { fixture, page: fixture.nativeElement as HTMLElement, judging, form: fixture.componentInstance };
  }

  it("shows the session's competition, and a box for each of its speakers with its judges ticked", () => {
    const { page, form, judging } = render();

    expect(judging.eventJudging).toHaveBeenCalledWith('event');
    expect(form.form.get('judgedCompetition').value).toBe('graduate-poster');
    expect(form.form.get('judges').value).toEqual(['sp-2']);
    expect(page.textContent).toContain('Judges');
    // Each box's icon names whether it is ticked: Bo Bo is the judge.
    expect([...page.querySelectorAll('.judges tamu-gisc-checkbox')].map((c) => c.textContent.trim())).toEqual([
      'check_box_outline_blankAna Abe',
      'check_boxBo Bo'
    ]);
    expect(page.textContent).toContain('Judging closed');
  });

  it('offers the four competitions and none', () => {
    expect(render().form.judgedCompetitionDict.map((c) => c.value)).toEqual([
      '',
      'graduate-poster',
      'undergraduate-poster',
      'graduate-presentation',
      'undergraduate-presentation'
    ]);
  });

  it('asks for no judges until a competition is chosen', () => {
    const { page, fixture, form } = render();

    form.form.get('judgedCompetition').setValue('');
    fixture.detectChanges();

    expect(page.querySelector('.judges')).toBeNull();
    expect(page.textContent).not.toContain('Judging closed');
  });

  it("saves the judges among the session's speakers only", () => {
    const { form } = render();

    form.form.patchValue({ judges: ['sp-2', 'sp-gone'], judgingClosed: true });

    expect(form.payload()).toEqual(
      expect.objectContaining({ judgedCompetition: 'graduate-poster', judgingClosed: true, judges: ['sp-2'] })
    );
  });

  it('leaves the judges out of a save until they have been read, so it does not clear them', () => {
    const { form } = render({ judging: { eventJudging: vi.fn(() => NEVER) } });

    expect(form.payload()).not.toHaveProperty('judges');
  });

  it('is not on a site that runs no research competitions', () => {
    const { page, judging, form } = render({ site: 'ucgis' });

    expect(form.judgingOn).toBe(false);
    expect(page.textContent).not.toContain('Judging');
    expect(judging.eventJudging).not.toHaveBeenCalled();
  });
});

/**
 * #3827. An event's observed attendance, which a session's page records, is kept when the event is saved from here.
 *
 * The API never returns the two counts with an event (`select: false`), so the form opened with them empty and every save
 * sent both as null, erasing them: 12 and 15 in the database became NULL after an update that changed only the abstract.
 * The form now reads them from the event's own attendance route, as it reads its judges, and leaves them out of a save
 * until it has.
 */
describe('EventAddEditFormComponent, the attendance counts (#3827)', () => {
  // A made-up event, as the API returns it: no counts.
  const event = { guid: 'event', name: 'A workshop', abstract: 'Made up', speakers: [], tags: [] };

  function create(
    type: 'create' | 'edit',
    attendance: Observable<object> = of({
      guid: 'event',
      observedAttendeeStart: 12,
      observedAttendeeEnd: 15
    })
  ) {
    const getEventAttendance = vi.fn(() => attendance);

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { params: of({ guid: 'event' }) } },
        { provide: SeasonService, useValue: { activeSeason$: of({ guid: 'season', days: [] }) } },
        { provide: SpeakerService, useValue: { getEntitiesForActiveSeason: () => of([]) } },
        { provide: TagService, useValue: { getEntitiesForActiveSeason: () => of([]) } },
        { provide: LocationService, useValue: { getEntitiesForActiveSeason: () => of([]) } },
        { provide: BroadcastService, useValue: { getEntitiesForActiveSeason: () => of([]) } },
        { provide: EventService, useValue: { getEntity: () => of(event), getEventAttendance } },
        { provide: NotificationService, useValue: { toast: vi.fn() } },
        { provide: SpeakerEditsService, useValue: {} },
        { provide: SessionFilesService, useValue: { forEvent: () => of([]) } },
        { provide: JudgingService, useValue: judgingService() },
        { provide: ModalService, useValue: {} }
      ]
    });
    TestBed.overrideTemplate(EventAddEditFormComponent, '');

    const fixture = TestBed.createComponent(EventAddEditFormComponent);
    fixture.componentRef.setInput('type', type);
    fixture.componentInstance.ngOnInit();

    return { form: fixture.componentInstance, getEventAttendance };
  }

  it("opens an event with its recorded counts, read from the event's attendance route", () => {
    const { form, getEventAttendance } = create('edit');

    expect(getEventAttendance).toHaveBeenCalledWith('event');
    expect(form.form.getRawValue()).toEqual(expect.objectContaining({ observedAttendeeStart: 12, observedAttendeeEnd: 15 }));
  });

  it('saves the counts it opened with when only the abstract was changed', () => {
    const { form } = create('edit');

    form.form.patchValue({ abstract: 'Changed' });

    expect(form.payload()).toEqual(
      expect.objectContaining({ abstract: 'Changed', observedAttendeeStart: 12, observedAttendeeEnd: 15 })
    );
  });

  it('leaves the counts out of a save until they have been read, so it does not clear them', () => {
    const { form } = create('edit', NEVER);

    expect(form.payload()).not.toHaveProperty('observedAttendeeStart');
    expect(form.payload()).not.toHaveProperty('observedAttendeeEnd');
  });

  it('saves counts typed into a new event as whole numbers, and an empty box as none', () => {
    const { form, getEventAttendance } = create('create');

    form.form.patchValue({ observedAttendeeStart: '12', observedAttendeeEnd: '' });

    expect(getEventAttendance).not.toHaveBeenCalled();
    expect(form.payload()).toEqual(expect.objectContaining({ observedAttendeeStart: 12, observedAttendeeEnd: null }));
  });
});

/** The Judging section from the page's own template. */
function judgingSection(): string {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { readFileSync } = require('fs');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { join } = require('path');
  const html: string = readFileSync(join(__dirname, 'event-add-edit-form.component.html'), 'utf8');
  const start = html.indexOf('@if (judgingOn) {');
  const end = html.indexOf('@if (slides(); as slides) {');

  return `<form [formGroup]="form">${html.slice(start, end)}</form>`;
}
