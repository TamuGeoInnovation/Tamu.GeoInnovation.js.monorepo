import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { firstValueFrom, of } from 'rxjs';

import {
  BroadcastService,
  EventService,
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

/**
 * #2706. "Is accepting RSVPs?" starts ticked on a new event, as the database column's default is, so an event made in the
 * admin pages accepts RSVPs unless the organizer unticks it. On 6 November 2026 every one of the 45 active events on each
 * site had been saved with it off.
 */
describe('EventAddEditFormComponent', () => {
  let speakerEdits: { preview: jest.Mock; send: jest.Mock };
  let modals: { open: jest.Mock };

  function create(type: 'create' | 'edit', event?: object, seasonSpeakers: Array<object> = []) {
    speakerEdits = { preview: jest.fn(() => of({ groups: [] })), send: jest.fn(() => of({ sent: [], skipped: [] })) };
    modals = { open: jest.fn(() => of({ profile: 'Hi {edit link}', 'profile:subject': 'Profile' })) };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { params: of({ guid: 'event' }) } },
        { provide: SeasonService, useValue: { activeSeason$: of({ guid: 'season', days: [] }) } },
        { provide: SpeakerService, useValue: { getEntitiesForActiveSeason: () => of(seasonSpeakers) } },
        { provide: TagService, useValue: { getEntitiesForActiveSeason: () => of([]) } },
        { provide: LocationService, useValue: { getEntitiesForActiveSeason: () => of([]) } },
        { provide: BroadcastService, useValue: { getEntitiesForActiveSeason: () => of([]) } },
        { provide: EventService, useValue: { getEntity: () => of(event) } },
        { provide: NotificationService, useValue: { toast: jest.fn() } },
        { provide: SpeakerEditsService, useValue: speakerEdits },
        { provide: SessionFilesService, useValue: { forEvent: () => of([]) } },
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
});

/** #3023: the event's own "Email speakers their edit links" shows the email first, editable, as the other two places do. */
describe('EventAddEditFormComponent, the profile email', () => {
  it("shows the email for the event's speakers first, then sends it as edited", () => {
    const speakerEdits = { preview: jest.fn(() => of({ groups: [] })), send: jest.fn(() => of({ sent: [], skipped: [] })) };
    const modals = { open: jest.fn(() => of({ profile: 'Hi {edit link}', 'profile:subject': 'Profile' })) };

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
        { provide: NotificationService, useValue: { toast: jest.fn() } },
        { provide: SpeakerEditsService, useValue: speakerEdits },
        { provide: SessionFilesService, useValue: { forEvent: () => of([]) } },
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
        { provide: EventService, useValue: { getEntity: () => of(event) } },
        { provide: NotificationService, useValue: { toast: jest.fn() } },
        { provide: SpeakerEditsService, useValue: {} },
        { provide: SessionFilesService, useValue: { forEvent: () => of([]) } },
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
 * buttons side by side. Session details opens the same window as the profile email, prefilled from the session.
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
      preview: jest.fn(() => of({ groups: [] })),
      send: jest.fn(() => of({ sent: [], skipped: [] })),
      previewSessionDetails: jest.fn(() => of({ groups: [] })),
      sendSessionDetails: jest.fn(() => of({ sent: ['Ana Abe'], skipped: [] }))
    };
    const modals = {
      open: jest.fn((_component: unknown, options: { data: { verb: string } }) =>
        of(
          closesWith && options.data.verb === 'Send profile email'
            ? { profile: 'Hi {edit link}', 'profile:subject': 'Profile' }
            : closesWith
        )
      )
    };
    const toasts = { toast: jest.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { params: of({ guid: 'event' }) } },
        { provide: SeasonService, useValue: { activeSeason$: of({ guid: 'season', days: [] }) } },
        { provide: SpeakerService, useValue: { getEntitiesForActiveSeason: () => of(event.speakers) } },
        { provide: TagService, useValue: { getEntitiesForActiveSeason: () => of([]) } },
        { provide: LocationService, useValue: { getEntitiesForActiveSeason: () => of([]) } },
        { provide: BroadcastService, useValue: { getEntitiesForActiveSeason: () => of([]) } },
        { provide: EventService, useValue: { getEntity: () => of(event) } },
        { provide: NotificationService, useValue: toasts },
        { provide: SpeakerEditsService, useValue: speakerEdits },
        { provide: SessionFilesService, useValue: { forEvent: () => of([]) } },
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

    return { page, fixture, speakerEdits, modals, toasts, choose };
  }

  it('shows one Email these speakers menu with Profile email and Session details, and no separate email buttons', () => {
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
      'Session details'
    ]);
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
    const sessionFiles = { forEvent: jest.fn(() => of(files)), download: jest.fn(() => of(new Blob(['x']))) };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { params: of({ guid: 'event' }) } },
        { provide: SeasonService, useValue: { activeSeason$: of({ guid: 'season', days: [] }) } },
        { provide: SpeakerService, useValue: { getEntitiesForActiveSeason: () => of([]) } },
        { provide: TagService, useValue: { getEntitiesForActiveSeason: () => of([]) } },
        { provide: LocationService, useValue: { getEntitiesForActiveSeason: () => of([]) } },
        { provide: BroadcastService, useValue: { getEntitiesForActiveSeason: () => of([]) } },
        { provide: EventService, useValue: { getEntity: () => of({ guid: 'event', speakers: [], tags: [] }) } },
        { provide: NotificationService, useValue: { toast: jest.fn() } },
        { provide: SpeakerEditsService, useValue: {} },
        { provide: SessionFilesService, useValue: sessionFiles },
        { provide: ModalService, useValue: {} }
      ]
    });
    // Only the Slides section, as the page draws it.
    TestBed.overrideTemplate(EventAddEditFormComponent, slidesSection());

    const fixture = TestBed.createComponent(EventAddEditFormComponent);
    fixture.componentRef.setInput('type', type);
    fixture.detectChanges();

    return { page: fixture.nativeElement as HTMLElement, sessionFiles };
  }

  it("lists the session's slides with their size and date, each a download", () => {
    const { page, sessionFiles } = render('edit');

    expect(page.querySelector('.form-section-title').textContent.trim()).toBe('Slides');
    expect(sessionFiles.forEvent).toHaveBeenCalledWith('event');

    const name = page.querySelector<HTMLButtonElement>('button.file-name');

    expect(name.textContent.trim()).toBe('Example watersheds.pptx');
    expect(page.querySelector('.file-detail').textContent).toContain('3.1 MB');

    Object.assign(URL, { createObjectURL: jest.fn(() => 'blob:deck'), revokeObjectURL: jest.fn() });
    name.click();

    expect(sessionFiles.download).toHaveBeenCalledWith('event', 'f-1');
  });

  it('offers nothing to change them, and says when there are none', () => {
    const { page } = render('edit', []);

    expect(page.querySelector('.files-empty').textContent.trim()).toBe('No slides uploaded yet.');
    expect(page.querySelector('tamu-gisc-file')).toBeNull();
    expect(page.textContent).not.toContain('Remove');
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
