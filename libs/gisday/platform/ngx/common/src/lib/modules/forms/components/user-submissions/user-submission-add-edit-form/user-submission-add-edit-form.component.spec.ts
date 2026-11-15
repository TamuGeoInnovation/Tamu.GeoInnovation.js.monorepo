import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { GISDAY_SITES } from '@tamu-gisc/gisday/common';
import { SeasonService, SubmissionTypeService, UserSubmissionsService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

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
        { provide: NotificationService, useValue: { toast } }
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

  it('names its own site in the message after submitting', () => {
    const fixture = render('create');

    fixture.componentInstance.handleSubmission();

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('The Texas A&M GIS Day team will review') })
    );
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
        { provide: NotificationService, useValue: { toast: jest.fn() } }
      ]
    });

    const fixture = TestBed.createComponent(UserSubmissionAddEditFormComponent);
    fixture.componentRef.setInput('type', type);
    fixture.detectChanges();

    return fixture.componentInstance;
  }

  const offered = (form: UserSubmissionAddEditFormComponent) => form.submissionTypeOptions().map((o) => o.type);

  it('offers every competition when the season has no rows (#2948)', () => {
    expect(offered(render('create', { competitions: [] }))).toEqual([
      'presentation',
      'paper',
      'poster',
      'cartography'
    ]);
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
