import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { of, Subject } from 'rxjs';

import { SUBMISSION_CLASSIFICATION_OPTIONS, SUBMISSION_TYPE_OPTIONS } from '@tamu-gisc/gisday/platform/ngx/common';
import {
  SeasonService,
  SpeakerEditsService,
  UserSubmissionsService,
  finalRemindersToast,
  reviewSubmissionsToast,
  sendEditLinksToast,
  EventService
} from '@tamu-gisc/gisday/platform/ngx/data-access';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { ReviewEmailModalComponent } from '@tamu-gisc/gisday/platform/ngx/common';
import {
  ResearchCompetitionListComponent,
  filesToZip,
  withData,
  profileEmailNote
} from './research-competition-list.component';

/** #2817: a filter offers All and only the choices the season's submissions have. */
describe('withData', () => {
  const season = [
    { submissionType: 'poster', classificationType: 'graduate' },
    { submissionType: 'presentation', classificationType: 'graduate' },
    { submissionType: 'poster', classificationType: 'undergraduate' }
  ];

  it('offers All and only the types the season has, in the form’s order', () => {
    expect(withData(SUBMISSION_TYPE_OPTIONS, season, 'submissionType').map((o) => o.label)).toEqual([
      'All',
      'Presentation',
      'Poster'
    ]);
  });

  it('offers only the classifications the season has', () => {
    expect(
      withData(SUBMISSION_CLASSIFICATION_OPTIONS, season.slice(0, 2), 'classificationType').map((o) => o.label)
    ).toEqual(['All', 'Graduate']);
  });

  it('offers only All for a season with no submissions', () => {
    expect(withData(SUBMISSION_TYPE_OPTIONS, [], 'submissionType').map((o) => o.label)).toEqual(['All']);
  });
});

/**
 * #2924: the page sat white while the season's submissions loaded, which took long enough (#2925) to look broken. It
 * shows the site's loader until they arrive.
 */
describe('ResearchCompetitionListComponent while loading', () => {
  function open() {
    const submissions$ = new Subject<Array<unknown>>();
    const service = {
      getEntitiesForActiveSeason: () => submissions$,
      getEntitiesForSeason: () => submissions$,
      getEntities: () => submissions$
    };

    TestBed.configureTestingModule({
      imports: [ResearchCompetitionListComponent],
      providers: [
        provideRouter([]),
        { provide: UserSubmissionsService, useValue: service },
        { provide: SpeakerEditsService, useValue: {} },
        { provide: SeasonService, useValue: { seasons$: of([]), activeSeason$: of(null) } },
        // The competition settings panel's sessions to choose from (#3019).
        { provide: EventService, useValue: { getEntitiesForSeason: () => of([]) } },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: {} }, queryParams: of({}) } },
        { provide: ModalService, useValue: {} },
        { provide: NotificationService, useValue: { toast: vi.fn() } }
      ]
    });

    const fixture = TestBed.createComponent(ResearchCompetitionListComponent);
    fixture.detectChanges();

    return { fixture, submissions$, page: fixture.nativeElement as HTMLElement };
  }

  it('shows the loader until the submissions arrive', () => {
    const { page } = open();

    expect(page.querySelector('.loader')).not.toBeNull();
  });

  it('replaces the loader with the list once they have', () => {
    const { fixture, submissions$, page } = open();

    submissions$.next([{ guid: 's1', title: 'A poster', submissionType: 'poster', classificationType: 'graduate' }]);
    fixture.detectChanges();

    expect(page.querySelector('.loader')).toBeNull();
    expect(page.textContent).toContain('Showing 1 of 1 submissions.');
  });
});

/**
 * #2958: Approve, Reject and Send profile email for the selected submissions, beside Delete. Each is confirmed in the
 * page, saying how many will be emailed, makes one request for the whole selection, and puts the result in a toast.
 */
describe('ResearchCompetitionListComponent actions on the selected submissions', () => {
  const rows = [
    {
      guid: 's1',
      title: 'Flood maps',
      submissionType: 'poster',
      classificationType: 'graduate',
      participants: [
        { name: 'Ana Ruiz', email: 'ana@tamu.edu' },
        { name: 'Ben Lee', email: 'ben@tamu.edu' }
      ]
    },
    {
      guid: 's2',
      title: 'Campus trees',
      submissionType: 'presentation',
      classificationType: 'graduate',
      reviewed: true,
      acceptance: true,
      participants: [
        { name: 'Cy Diaz', email: 'cy@tamu.edu' },
        { name: 'Ana Ruiz', email: 'ANA@tamu.edu' }
      ]
    },
    { guid: 's3', title: 'Not chosen', submissionType: 'poster', classificationType: 'graduate', participants: [] }
  ];

  // The email text the reviewer approved in the window, by kind (#2981).
  const templates = { poster: 'Howdy {first name}, edited poster text', presentation: 'Edited presentation text' };
  const preview = { groups: [] };
  // The profile email's window closes with its text and its subject (#3023).
  const profileEmail = { profile: 'Hi {first name}: {edit link}', 'profile:subject': 'Your profile' };

  function open(confirmed: boolean) {
    const service = {
      previewReview: vi.fn(() => of(preview)),
      getEntitiesForActiveSeason: () => of(rows),
      getEntitiesForSeason: () => of(rows),
      getEntities: () => of(rows),
      review: vi.fn(() => of({ reviewed: ['Flood maps', 'Campus trees'], failed: [] }))
    };
    const speakerEdits = {
      previewForSubmissions: vi.fn(() => of(preview)),
      sendForSubmissions: vi.fn(() =>
        of({ sent: ['Ana Ruiz', 'Cy Diaz'], skipped: [], unmatched: [{ name: 'Ben Lee', submission: 'Flood maps' }] })
      )
    };
    // The email window closes with the approved texts, or nothing; the profile email's question with yes or no.
    const modals = {
      open: vi.fn((component: unknown, options?: { data?: { verb?: string } }) =>
        component === ReviewEmailModalComponent
          ? of(confirmed ? (options?.data?.verb === 'Send profile email' ? profileEmail : templates) : null)
          : of(confirmed)
      )
    };
    const toasts = { toast: vi.fn() };

    TestBed.configureTestingModule({
      imports: [ResearchCompetitionListComponent],
      providers: [
        provideRouter([]),
        { provide: UserSubmissionsService, useValue: service },
        { provide: SpeakerEditsService, useValue: speakerEdits },
        { provide: SeasonService, useValue: { seasons$: of([]), activeSeason$: of(null) } },
        // The competition settings panel's sessions to choose from (#3019).
        { provide: EventService, useValue: { getEntitiesForSeason: () => of([]) } },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: {} }, queryParams: of({}) } },
        { provide: ModalService, useValue: modals },
        { provide: NotificationService, useValue: toasts }
      ]
    });

    const fixture = TestBed.createComponent(ResearchCompetitionListComponent);
    fixture.detectChanges();
    fixture.componentInstance.toggleRow('s1');
    fixture.componentInstance.toggleRow('s2');
    fixture.detectChanges();

    const page = fixture.nativeElement as HTMLElement;
    const click = (label: string) => chooseSelectedAction(page, () => fixture.detectChanges(), label);

    return { service, speakerEdits, modals, toasts, click, page, fixture };
  }

  // #3174: the download takes the ticked submissions, and its button says so.
  it('downloads the files of the ticked submissions, and says how many', () => {
    const { page } = open(false);
    const download = [...page.querySelectorAll('.form-section-actions a[role=button]')].map((a) => a.textContent.trim());

    expect(download).toContain('Download files (2 ticked)');
  });

  it('offers Approve, Reject and the Email menu beside Delete', () => {
    const { click } = open(false);

    for (const label of ['Approve', 'Reject', 'Profile email', 'Final reminder', 'Delete']) {
      click(label);
    }
  });

  // #3092: the two emails are one menu, rather than two more actions side by side in the bar.
  it('puts Profile email and Final reminder in one Email menu, and no email action stands alone in the bar', () => {
    const { page, fixture } = open(false);
    const bar = page.querySelector('.selected-actions');
    const menus = bar.querySelectorAll('tamu-gisc-action-menu');

    expect(menus).toHaveLength(1);

    const trigger = menus[0].querySelector<HTMLButtonElement>('button[aria-haspopup="menu"]');

    expect(trigger.classList).toContain('selected-action');
    expect(trigger.textContent).toContain('Email');

    // Approve, Reject and Delete stay as they were; nothing else in the bar sends an email on its own.
    const alone = Array.from(bar.querySelectorAll<HTMLElement>('.selected-action'))
      .filter((a) => a !== trigger)
      .map((a) => a.textContent.replace(/\s+/g, ' ').trim());

    expect(alone).toEqual(['Approve check_circle', 'Reject cancel', 'Delete delete_forever']);

    trigger.click();
    fixture.detectChanges();

    expect(Array.from(bar.querySelectorAll('[role="menuitem"]')).map((i) => i.textContent.trim())).toEqual([
      'Profile email',
      'Final reminder'
    ]);
  });

  it('shows the email first, editable, then approves the selection in one request with the text approved (#2981)', () => {
    const { service, modals, toasts, click } = open(true);

    click('Approve');

    expect(modals.open).toHaveBeenCalledWith(
      ReviewEmailModalComponent,
      expect.objectContaining({ data: expect.objectContaining({ acceptance: true }) })
    );
    // The window loads the email the selection would get, for these submissions and this decision.
    expect(service.previewReview).toHaveBeenCalledWith(['s1', 's2'], true);
    // One of them was already reviewed; its submitter will hear again, and the window says so.
    expect(modals.open.mock.calls[0][1].data.note).toContain('1 of them has already been reviewed');
    expect(service.review).toHaveBeenCalledTimes(1);
    expect(service.review).toHaveBeenCalledWith(['s1', 's2'], true, undefined, templates);
    expect(toasts.toast).toHaveBeenCalledWith(
      reviewSubmissionsToast({ reviewed: ['Flood maps', 'Campus trees'], failed: [] }, true)
    );
  });

  it('shows the rejection email first, then rejects the selection with the text approved', () => {
    const { service, click } = open(true);

    click('Reject');

    expect(service.previewReview).toHaveBeenCalledWith(['s1', 's2'], false);
    expect(service.review).toHaveBeenCalledWith(['s1', 's2'], false, undefined, templates);
  });

  it('shows the profile email first, editable, counting the people once each, then sends it as edited (#3023)', () => {
    const { speakerEdits, modals, toasts, click } = open(true);

    click('Profile email');

    expect(modals.open).toHaveBeenCalledWith(
      ReviewEmailModalComponent,
      expect.objectContaining({ data: expect.objectContaining({ verb: 'Send profile email', editableSubject: true }) })
    );
    expect(modals.open.mock.calls[0][1].data.note).toContain('the 3 people of 2 submissions');
    expect(modals.open.mock.calls[0][1].data.note).toContain("listed below and won't be emailed");
    expect(speakerEdits.previewForSubmissions).toHaveBeenCalledWith(['s1', 's2']);
    expect(speakerEdits.sendForSubmissions).toHaveBeenCalledWith(['s1', 's2'], {
      subject: 'Your profile',
      template: 'Hi {first name}: {edit link}'
    });
    expect(toasts.toast).toHaveBeenCalledWith(
      sendEditLinksToast({
        sent: ['Ana Ruiz', 'Cy Diaz'],
        skipped: [],
        unmatched: [{ name: 'Ben Lee', submission: 'Flood maps' }]
      })
    );
  });

  it('sends nothing when the admin cancels', () => {
    const { service, speakerEdits, toasts, click } = open(false);

    click('Approve');
    click('Reject');
    click('Profile email');

    expect(service.review).not.toHaveBeenCalled();
    expect(speakerEdits.sendForSubmissions).not.toHaveBeenCalled();
    expect(toasts.toast).not.toHaveBeenCalled();
  });
});

/**
 * #3017: who has uploaded their final presentation or poster, as a column that sorts, and a final reminder to the rest,
 * by the review email's own window. A submission's files have no kind, so any file it has counts as its final one.
 */
describe('ResearchCompetitionListComponent, the final file and the final reminder (#3017)', () => {
  const accepted = { reviewed: true, acceptance: true };
  const rows = [
    { guid: 's1', title: 'Flood maps', submissionType: 'poster', participants: [], files: [], ...accepted },
    {
      guid: 's2',
      title: 'Campus trees',
      submissionType: 'presentation',
      participants: [],
      files: [{ guid: 'f-1', name: 'slides.pptx' }],
      ...accepted
    },
    { guid: 's3', title: 'Bike lanes', submissionType: 'presentation', participants: [], ...accepted },
    // Not accepted, so skipped too (decided 15 November): one rejected, one not yet reviewed.
    { guid: 's4', title: 'Old roads', submissionType: 'poster', participants: [], reviewed: true, acceptance: false },
    { guid: 's5', title: 'Rivers', submissionType: 'presentation', participants: [] }
  ];
  const templates = { 'poster-reminder': 'Edited reminder' };
  const result = {
    sent: ['Flood maps'],
    skipped: [{ title: 'Campus trees', reason: 'already has a file' as const }],
    failed: []
  };

  function open(selected: Array<string>, confirmed = true) {
    const service = {
      previewReminders: vi.fn(() => of({ groups: [], skipped: [] })),
      remind: vi.fn(() => of(result)),
      getEntitiesForActiveSeason: () => of(rows),
      getEntitiesForSeason: () => of(rows),
      getEntities: () => of(rows)
    };
    const modals = { open: vi.fn(() => of(confirmed ? templates : null)) };
    const toasts = { toast: vi.fn() };

    TestBed.configureTestingModule({
      imports: [ResearchCompetitionListComponent],
      providers: [
        provideRouter([]),
        { provide: UserSubmissionsService, useValue: service },
        { provide: SpeakerEditsService, useValue: {} },
        { provide: SeasonService, useValue: { seasons$: of([]), activeSeason$: of(null) } },
        // The competition settings panel's sessions to choose from (#3019).
        { provide: EventService, useValue: { getEntitiesForSeason: () => of([]) } },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: {} }, queryParams: of({}) } },
        { provide: ModalService, useValue: modals },
        { provide: NotificationService, useValue: toasts }
      ]
    });

    const fixture = TestBed.createComponent(ResearchCompetitionListComponent);
    fixture.detectChanges();
    selected.forEach((guid) => fixture.componentInstance.toggleRow(guid));
    fixture.detectChanges();

    const page = fixture.nativeElement as HTMLElement;
    const click = (label: string) => chooseSelectedAction(page, () => fixture.detectChanges(), label);

    return { fixture, page, service, modals, toasts, click };
  }

  it('shows each submission as Uploaded or Missing, in a column of its own that sorts', () => {
    const { page } = open([]);
    const headings = Array.from(page.querySelectorAll('.datatable-header-cell')).map((h) => h.textContent.trim());
    const column = headings.indexOf('Final file');

    expect(column).toBeGreaterThan(-1);
    expect(page.querySelectorAll('.datatable-header-cell')[column].classList).toContain('sortable');

    const cells = Array.from(page.querySelectorAll('datatable-body-row')).map((row) =>
      row.querySelectorAll('.datatable-body-cell')[column].textContent.trim()
    );

    expect(cells.sort()).toEqual(['Missing', 'Missing', 'Missing', 'Missing', 'Uploaded']);
  });

  /**
   * #3026: at 1280 px the table was cramped. Files and Final file ran together, short values broke mid-word ("Mis/sin/g",
   * "Acce/pted"), and the select column's checkbox covered each title's first letter. Final file now says what the Files
   * count did; the short values keep a width they fit in, whole; and the checkbox has the room it takes.
   */
  it('fits at 1280 px: no Files count beside Final file, short values whole, the checkbox clear of the title (#3026)', () => {
    const { fixture, page } = open([]);
    const headings = Array.from(page.querySelectorAll('.datatable-header-cell')).map((h) => h.textContent.trim());
    const table = fixture.debugElement.query(By.directive(DatatableComponent)).componentInstance as DatatableComponent;
    const column = (name: string) => table._internalColumns().find((c) => c.name === name);

    expect(headings).not.toContain('Files');
    expect(headings).toContain('Final file');

    for (const name of ['Type', 'Format', 'Final file', 'Status']) {
      expect(column(name).minWidth).toBeGreaterThanOrEqual(100);
      expect(String(column(name).cellClass)).toContain('whole-value');
    }

    const select = table._internalColumns().find((c) => c.prop === 'select');

    expect(select.width()).toBeGreaterThanOrEqual(56);
    expect(select.minWidth).toBeGreaterThanOrEqual(56);
  });

  /**
   * #3026, the review of the fix above: the columns' minimums then added up to more than the table (1015 px in the 879
   * a 1280 px screen gives it, 848 in 681 at 1024), and ngx-datatable drew the overflow off the table's left edge, taking
   * the checkbox and the Name column with it. The table is now never narrower than its columns at their narrowest, so
   * where they do not fit it scrolls sideways in its own box, as the dashboards' table does (#3006).
   */
  describe('its columns at their narrowest (#3026)', () => {
    const templates = (fixture: ReturnType<typeof open>['fixture']) =>
      fixture.debugElement.query(By.directive(DatatableComponent)).injector.get(DatatableComponent).columnTemplates();
    const narrowest = (fixture: ReturnType<typeof open>['fixture']) =>
      templates(fixture).reduce((sum, column) => sum + (column.minWidth() ?? 0), 0);

    it('gives every column a narrowest, the select and Name columns included', () => {
      const { fixture } = open([]);

      for (const column of templates(fixture)) {
        expect([column.prop(), column.minWidth()]).toEqual([column.prop(), expect.any(Number)]);
        expect(column.minWidth()).toBeGreaterThan(0);
      }
    });

    it('is never narrower than its columns at their narrowest, so none is drawn off its left edge', () => {
      const { fixture, page } = open([]);
      const table = page.querySelector('ngx-datatable') as HTMLElement;

      expect(narrowest(fixture)).toBeGreaterThan(0);
      expect(table.style.minWidth).toBe(`${narrowest(fixture)}px`);
    });

    it('keeps the checkbox column at its width and grows every other column in proportion to its narrowest', () => {
      const { fixture } = open([]);
      const [select, ...rest] = templates(fixture);

      expect(select.prop()).toBe('select');
      expect(select.canAutoResize()).toBe(false);
      expect(select.width()).toBe(select.minWidth());

      const ratios = rest.map((column) => (column.flexGrow() ?? 0) / (column.minWidth() ?? 1));

      expect(new Set(ratios)).toEqual(new Set([1]));
    });

    // Measured in Playwright at the table's 0.9rem: "Pending Review", bold, is 110 px wide and "Presentation" 89, and a
    // cell's side padding is 16.
    it('holds the longest Status and Type whole', () => {
      const { fixture } = open([]);
      const minWidth = (prop: string) =>
        templates(fixture)
          .find((column) => column.prop() === prop)
          ?.minWidth();

      expect(minWidth('reviewStatus')).toBeGreaterThanOrEqual(110 + 16);
      expect(minWidth('submissionType')).toBeGreaterThanOrEqual(89 + 16);
    });
  });

  it('shows the reminder first, editable, saying how many are skipped for having a file, then sends it with the text approved', () => {
    const { service, modals, toasts, click } = open(['s1', 's2']);

    click('Final reminder');

    expect(service.previewReminders).toHaveBeenCalledWith(['s1', 's2']);
    expect(modals.open).toHaveBeenCalledWith(
      ReviewEmailModalComponent,
      expect.objectContaining({ data: expect.objectContaining({ verb: 'Send final reminder' }) })
    );
    expect(modals.open.mock.calls[0][1].data.note).toBe(
      '1 of the 2 selected is skipped: 1 that already has a file. Only the rest are reminded.'
    );
    expect(service.remind).toHaveBeenCalledWith(['s1', 's2'], templates);
    expect(toasts.toast).toHaveBeenCalledWith(finalRemindersToast(result));
  });

  it('skips those not accepted as well, and says why each group is skipped', () => {
    const { service, modals, click } = open(['s1', 's2', 's4', 's5']);

    click('Final reminder');

    expect(modals.open.mock.calls[0][1].data.note).toBe(
      '3 of the 4 selected are skipped: 1 that already has a file and 2 that were not accepted. Only the rest are reminded.'
    );
    expect(service.previewReminders).toHaveBeenCalledWith(['s1', 's2', 's4', 's5']);
  });

  it('sends nothing, and says why, when every one selected is skipped', () => {
    const { modals, toasts, click } = open(['s2', 's4']);

    click('Final reminder');

    expect(modals.open).not.toHaveBeenCalled();
    expect(toasts.toast).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Nothing to send: 1 that already has a file and 1 that was not accepted.' })
    );
  });

  it('sends nothing, and says why, when every one selected already has a file', () => {
    const { service, modals, toasts, click } = open(['s2']);

    click('Final reminder');

    expect(modals.open).not.toHaveBeenCalled();
    expect(service.remind).not.toHaveBeenCalled();
    expect(toasts.toast).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('already has a file') })
    );
  });

  it('sends nothing when the admin cancels', () => {
    const { service, toasts, click } = open(['s1'], false);

    click('Final reminder');

    expect(service.remind).not.toHaveBeenCalled();
    expect(toasts.toast).not.toHaveBeenCalled();
  });
});

// #3043: the window's first line counts people as the server finds them: two addresses in one box are two people.
describe('profileEmailNote', () => {
  it('counts each address in a shared box, and a NetID once with its address', () => {
    const note = profileEmailNote([
      {
        participants: [
          { name: 'Eve Kim, Fay Ng', email: 'eve@tamu.edu; fay@tamu.edu' },
          { name: 'Gus', email: 'gus1' }
        ]
      },
      {
        participants: [
          { name: 'Gus', email: 'GUS1@tamu.edu' },
          { name: 'No Email', email: '' }
        ]
      }
    ] as never);

    expect(note).toContain('For the 4 people of 2 submissions.');
  });
});

/**
 * Chooses one of the selected rows' actions by its words: one in the bar, or one in its Email menu (#3092), opened first
 * as an admin opens it.
 */
function chooseSelectedAction(page: HTMLElement, detectChanges: () => void, label: string) {
  const inBar = Array.from(page.querySelectorAll<HTMLElement>('.selected-action:not([aria-haspopup])')).find((a) =>
    a.textContent.includes(label)
  );

  if (inBar) {
    inBar.click();
    detectChanges();
    return;
  }

  const trigger = page.querySelector<HTMLButtonElement>('.selected-actions button[aria-haspopup="menu"]');

  expect(trigger).not.toBeNull();
  trigger.click();
  detectChanges();

  const item = Array.from(page.querySelectorAll<HTMLElement>('[role="menuitem"]')).find(
    (i) => i.textContent.trim() === label
  );

  expect(item).toBeDefined();
  item.click();
  detectChanges();
}

/** #3174: which submissions' files the download takes. */
describe('filesToZip', () => {
  const rows = [{ guid: 's1' }, { guid: 's2' }, { guid: 's3' }];

  it('takes the ticked rows that are showing, in the order shown', () => {
    expect(filesToZip(['s3', 's1', 'hidden'], rows, 5)).toEqual({
      guids: ['s1', 's3'],
      label: 'Download files (2 ticked)',
      name: '2-ticked'
    });
  });

  it('takes the rows the filters show when none is ticked', () => {
    expect(filesToZip([], rows, 5)).toEqual({
      guids: ['s1', 's2', 's3'],
      label: 'Download files (3 shown)',
      name: '3-shown'
    });
  });

  it('takes the whole season, as before, when nothing narrows it', () => {
    expect(filesToZip(['hidden'], rows, 3)).toEqual({ guids: null, label: 'Download all files', name: '' });
  });
});
