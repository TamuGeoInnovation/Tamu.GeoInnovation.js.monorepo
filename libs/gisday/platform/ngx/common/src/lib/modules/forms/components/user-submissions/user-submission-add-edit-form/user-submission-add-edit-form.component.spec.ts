import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

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
      throwError(() => new HttpErrorResponse({ status: 403, error: { statusCode: 403, message: 'Submissions closed on 1 November.' } }))
    );

    fixture.componentInstance.handleSubmission();

    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ message: 'Submissions closed on 1 November.' }));
  });
});
