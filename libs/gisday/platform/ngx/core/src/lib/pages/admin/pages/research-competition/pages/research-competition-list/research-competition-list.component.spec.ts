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
  sendEditLinksToast
} from '@tamu-gisc/gisday/platform/ngx/data-access';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { ReviewEmailModalComponent } from '../../components/review-email-modal/review-email-modal.component';
import { ResearchCompetitionListComponent, withData } from './research-competition-list.component';

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
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: {} }, queryParams: of({}) } },
        { provide: ModalService, useValue: {} },
        { provide: NotificationService, useValue: { toast: jest.fn() } }
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

  function open(confirmed: boolean) {
    const service = {
      previewReview: jest.fn(() => of(preview)),
      getEntitiesForActiveSeason: () => of(rows),
      getEntitiesForSeason: () => of(rows),
      getEntities: () => of(rows),
      review: jest.fn(() => of({ reviewed: ['Flood maps', 'Campus trees'], failed: [] }))
    };
    const speakerEdits = {
      sendForSubmissions: jest.fn(() =>
        of({ sent: ['Ana Ruiz', 'Cy Diaz'], skipped: [], unmatched: [{ name: 'Ben Lee', submission: 'Flood maps' }] })
      )
    };
    // The email window closes with the approved texts, or nothing; the profile email's question with yes or no.
    const modals = {
      open: jest.fn((component: unknown) =>
        component === ReviewEmailModalComponent ? of(confirmed ? templates : null) : of(confirmed)
      )
    };
    const toasts = { toast: jest.fn() };

    TestBed.configureTestingModule({
      imports: [ResearchCompetitionListComponent],
      providers: [
        provideRouter([]),
        { provide: UserSubmissionsService, useValue: service },
        { provide: SpeakerEditsService, useValue: speakerEdits },
        { provide: SeasonService, useValue: { seasons$: of([]), activeSeason$: of(null) } },
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
    const click = (label: string) => {
      const action = Array.from(page.querySelectorAll<HTMLElement>('.selected-action')).find((a) =>
        a.textContent.includes(label)
      );

      expect(action).toBeDefined();
      action.click();
      fixture.detectChanges();
    };

    return { service, speakerEdits, modals, toasts, click };
  }

  it('offers Approve, Reject and Send profile email beside Delete', () => {
    const { click } = open(false);

    for (const label of ['Approve', 'Reject', 'Send profile email', 'Delete']) {
      click(label);
    }
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

  it('asks before sending profile emails, counting the people once each, and lists anyone with no speaker record', () => {
    const { speakerEdits, modals, toasts, click } = open(true);

    click('Send profile email');

    expect(modals.open.mock.calls[0][1].data.message).toContain('Send profile emails to the 3 people of 2 submissions?');
    expect(speakerEdits.sendForSubmissions).toHaveBeenCalledWith(['s1', 's2']);
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
    click('Send profile email');

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
      previewReminders: jest.fn(() => of({ groups: [], skipped: [] })),
      remind: jest.fn(() => of(result)),
      getEntitiesForActiveSeason: () => of(rows),
      getEntitiesForSeason: () => of(rows),
      getEntities: () => of(rows)
    };
    const modals = { open: jest.fn(() => of(confirmed ? templates : null)) };
    const toasts = { toast: jest.fn() };

    TestBed.configureTestingModule({
      imports: [ResearchCompetitionListComponent],
      providers: [
        provideRouter([]),
        { provide: UserSubmissionsService, useValue: service },
        { provide: SpeakerEditsService, useValue: {} },
        { provide: SeasonService, useValue: { seasons$: of([]), activeSeason$: of(null) } },
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
    const click = (label: string) => {
      Array.from(page.querySelectorAll<HTMLElement>('.selected-action'))
        .find((a) => a.textContent.includes(label))
        .click();
      fixture.detectChanges();
    };

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
      const minWidth = (prop: string) => templates(fixture).find((column) => column.prop() === prop)?.minWidth();

      expect(minWidth('reviewStatus')).toBeGreaterThanOrEqual(110 + 16);
      expect(minWidth('submissionType')).toBeGreaterThanOrEqual(89 + 16);
    });
  });

  it('shows the reminder first, editable, saying how many are skipped for having a file, then sends it with the text approved', () => {
    const { service, modals, toasts, click } = open(['s1', 's2']);

    click('Send final reminder');

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

    click('Send final reminder');

    expect(modals.open.mock.calls[0][1].data.note).toBe(
      '3 of the 4 selected are skipped: 1 that already has a file and 2 that were not accepted. Only the rest are reminded.'
    );
    expect(service.previewReminders).toHaveBeenCalledWith(['s1', 's2', 's4', 's5']);
  });

  it('sends nothing, and says why, when every one selected is skipped', () => {
    const { modals, toasts, click } = open(['s2', 's4']);

    click('Send final reminder');

    expect(modals.open).not.toHaveBeenCalled();
    expect(toasts.toast).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Nothing to send: 1 that already has a file and 1 that was not accepted.' })
    );
  });

  it('sends nothing, and says why, when every one selected already has a file', () => {
    const { service, modals, toasts, click } = open(['s2']);

    click('Send final reminder');

    expect(modals.open).not.toHaveBeenCalled();
    expect(service.remind).not.toHaveBeenCalled();
    expect(toasts.toast).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('already has a file') })
    );
  });

  it('sends nothing when the admin cancels', () => {
    const { service, toasts, click } = open(['s1'], false);

    click('Send final reminder');

    expect(service.remind).not.toHaveBeenCalled();
    expect(toasts.toast).not.toHaveBeenCalled();
  });
});
