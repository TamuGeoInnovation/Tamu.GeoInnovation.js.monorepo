import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { GISDAY_SITES } from '@tamu-gisc/gisday/common';
import { SeasonService, SubmissionTypeService, UserSubmissionsService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { AuthService } from '@tamu-gisc/common/ngx/auth';

import { GISDAY_SITE } from '../../../../../site/site';
import { UserSubmissionAddEditFormComponent } from './user-submission-add-edit-form.component';

/**
 * #2968. The student's submission form named TxGIS Day on every site: on Texas A&M's it must say Texas A&M GIS Day, in the
 * Presentation files box and in the message after submitting.
 */
describe('UserSubmissionAddEditFormComponent, on Texas A&M site', () => {
  const entity = {
    guid: 'sub-1',
    title: 'Mapping Floods',
    participants: [],
    reviewed: false,
    submissionType: 'poster',
    season: null
  };
  let toast: jest.Mock;
  let createEntity: jest.Mock;

  function render(type: 'create' | 'edit') {
    toast = jest.fn();
    createEntity = jest.fn(() => of({}));
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: GISDAY_SITE, useValue: GISDAY_SITES.tamu },
        { provide: ActivatedRoute, useValue: { params: of({ guid: 'sub-1' }) } },
        { provide: UserSubmissionsService, useValue: { getEntity: () => of(entity), getFiles: () => of([]), createEntity } },
        { provide: SubmissionTypeService, useValue: { getEntities: () => of([]) } },
        { provide: SeasonService, useValue: { getActiveSeason: () => of({ guid: 'season' }) } },
        { provide: NotificationService, useValue: { toast } },
        {
          provide: AuthService,
          useValue: { user$: of({ given_name: 'Ana', family_name: 'Ruiz', name: 'ana@tamu.edu', email: 'Ana@tamu.edu' }) }
        }
      ]
    });

    const fixture = TestBed.createComponent(UserSubmissionAddEditFormComponent);
    fixture.componentRef.setInput('type', type);
    fixture.detectChanges();

    return fixture;
  }

  it('names its own site in the Presentation files box', () => {
    const page = render('edit').nativeElement as HTMLElement;

    expect(page.textContent).toContain('so the Texas A&M GIS Day team has it on the day');
    expect(page.textContent).not.toContain('TxGIS Day');
  });

  // #3144: finalists were not finding it below the whole form, so it comes first, above the form's own sections.
  it('puts Presentation files first on an existing submission, above the form, and leaves it off a new one', () => {
    const titles = (type: 'create' | 'edit') =>
      [...(render(type).nativeElement as HTMLElement).querySelectorAll('.form-section-title')].map((t) =>
        t.textContent.trim()
      );

    expect(titles('edit')).toEqual(['Presentation files', 'Modify Student Competition Submission']);
    TestBed.resetTestingModule();
    expect(titles('create')).toEqual(['Student Competition Submission']);
  });

  it('names its own site in the message after submitting', () => {
    const fixture = render('create');

    fixture.componentInstance.handleSubmission();

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('The Texas A&M GIS Day team will review') })
    );
  });

  // #2990: the submitter is the signed-in account, so their name and email come from it and cannot be typed.
  it("fills the submitter's name and email from their account, and does not let them be typed", () => {
    const fixture = render('create');
    const submitter = fixture.componentInstance.form.get('participants.0');

    expect(submitter.get('name').value).toBe('Ana Ruiz');
    expect(submitter.get('email').value).toBe('ana@tamu.edu');
    expect(submitter.get('name').disabled).toBe(true);
    expect(submitter.get('email').disabled).toBe(true);
    // No student ID is asked for: the directory lookup gives it.
    expect(submitter.get('studentId')).toBeNull();
    expect((fixture.nativeElement as HTMLElement).textContent).not.toContain('Student ID');
  });

  // #2990: a group's other authors go in two boxes, names and emails one per line in the same order.
  it("saves the co-authors after the submitter, each line's name with the same line's email", () => {
    const fixture = render('create');
    const form = fixture.componentInstance.form;

    form.patchValue({
      title: 'Heat',
      format: 'group',
      coAuthors: 'Ben Lee\n\nCy Diaz',
      coAuthorEmails: 'BEN@tamu.edu\n\ncy@tamu.edu'
    });
    fixture.componentInstance.handleSubmission();

    const sent = createEntity.mock.calls[0][0];

    expect(sent.participants).toEqual([
      { name: 'Ana Ruiz', email: 'ana@tamu.edu' },
      { name: 'Ben Lee', email: 'ben@tamu.edu' },
      { name: 'Cy Diaz', email: 'cy@tamu.edu' }
    ]);
    expect(sent.coAuthors).toBeUndefined();
    expect(sent.coAuthorEmails).toBeUndefined();
  });

  it('keeps only the submitter for an individual submission', () => {
    const fixture = render('create');

    fixture.componentInstance.form.patchValue({ format: 'group', coAuthors: 'Ben Lee', coAuthorEmails: 'ben@tamu.edu' });
    fixture.componentInstance.form.patchValue({ format: 'individual' });
    fixture.componentInstance.handleSubmission();

    expect(createEntity.mock.calls[0][0].participants).toEqual([{ name: 'Ana Ruiz', email: 'ana@tamu.edu' }]);
  });

  it("shows a saved group's other authors in the co-author boxes, one per line", () => {
    entity.participants = [
      { name: 'Ana', email: 'ana@tamu.edu' },
      { name: 'Ben Lee', email: 'ben@tamu.edu' },
      { name: 'Cy Diaz', email: 'cy@tamu.edu' }
    ] as never;

    const form = render('edit').componentInstance.form;

    expect(form.get('coAuthors').value).toBe('Ben Lee\nCy Diaz');
    expect(form.get('coAuthorEmails').value).toBe('ben@tamu.edu\ncy@tamu.edu');
    expect((form.get('participants') as unknown as { length: number }).length).toBe(1);
    entity.participants = [];
  });

  // Only a closed competition's 403 reached the student; any other refusal said "Please try again later" (#2966).
  it("shows the API's reason when a submission is refused", () => {
    const fixture = render('create');
    createEntity.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 400,
            error: { statusCode: 400, message: ['title should not be empty', 'abstract should not be empty'] }
          })
      )
    );

    fixture.componentInstance.handleSubmission();

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'title should not be empty; abstract should not be empty' })
    );
  });

  it("still shows the API's words when the competition has closed (#2934)", () => {
    const fixture = render('create');
    createEntity.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({ status: 403, error: { statusCode: 403, message: 'Submissions closed on 1 November.' } })
      )
    );

    fixture.componentInstance.handleSubmission();

    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ message: 'Submissions closed on 1 November.' }));
  });
});

/** #2948: the form offers only the research competitions the season runs. */
describe('UserSubmissionAddEditFormComponent, the competitions it offers', () => {
  function render(type: 'create' | 'edit', season: Record<string, unknown>, submissionType = 'paper') {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: GISDAY_SITE, useValue: GISDAY_SITES.tamu },
        { provide: ActivatedRoute, useValue: { params: of({ guid: 'sub-1' }) } },
        {
          provide: UserSubmissionsService,
          useValue: {
            getEntity: () => of({ guid: 'sub-1', title: 'Old', participants: [], reviewed: false, submissionType, season }),
            getFiles: () => of([]),
            createEntity: jest.fn(() => of({}))
          }
        },
        { provide: SubmissionTypeService, useValue: { getEntities: () => of([]) } },
        { provide: SeasonService, useValue: { getActiveSeason: () => of({ guid: 'season', ...season }) } },
        { provide: NotificationService, useValue: { toast: jest.fn() } },
        { provide: AuthService, useValue: { user$: of({ given_name: 'Ana', family_name: 'Ruiz', email: 'ana@example.edu' }) } }
      ]
    });

    const fixture = TestBed.createComponent(UserSubmissionAddEditFormComponent);
    fixture.componentRef.setInput('type', type);
    fixture.detectChanges();

    return fixture.componentInstance;
  }

  const offered = (form: UserSubmissionAddEditFormComponent) => form.submissionTypeOptions().map((o) => o.type);

  it('offers every competition when the season has no rows (#2948)', () => {
    expect(offered(render('create', { competitions: [] }))).toEqual(['presentation', 'paper', 'poster', 'cartography']);
  });

  it('offers only those the season runs, and starts on one of them', () => {
    const form = render('create', { competitions: [{ competitionType: 'poster' }] });

    expect(offered(form)).toEqual(['poster']);
    expect(form.form.get('submissionType').value).toBe('poster');
  });

  it("keeps a saved submission's own competition when it has since been turned off", () => {
    expect(offered(render('edit', { competitions: [{ competitionType: 'poster' }] }, 'paper'))).toEqual(['paper', 'poster']);
  });
});
