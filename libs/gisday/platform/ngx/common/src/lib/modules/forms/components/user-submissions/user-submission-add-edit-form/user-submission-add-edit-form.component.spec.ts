import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';

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
    // Their student ID is still theirs to give.
    expect(submitter.get('studentId').enabled).toBe(true);
  });

});
