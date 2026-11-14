import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { SeasonService, UserSubmissionsService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { SubmissionFilesComponent } from '@tamu-gisc/gisday/platform/ngx/common';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { ReviewEmailModalComponent } from '../../components/review-email-modal/review-email-modal.component';
import { ResearchCompetitionReviewComponent } from './research-competition-review.component';

@Component({ selector: 'tamu-gisc-submission-files', template: '' })
class FilesStubComponent {}

/** #2981: Submit Review shows the email the decision sends, editable, and decides and sends only on Send. */
describe('ResearchCompetitionReviewComponent, Submit Review', () => {
  const GUID = '0f8c9a52-1b2c-4d3e-8f4a-5b6c7d8e9f01';
  const templates = { poster: 'Howdy {first name}, edited' };

  function open(sent: Record<string, string> | null) {
    const service = {
      getEntity: () =>
        of({ guid: GUID, title: 'Flood maps', acceptance: false, message: '', participants: [], submissionType: 'poster' }),
      previewReview: jest.fn(() => of({ groups: [] })),
      review: jest.fn(() => of({ reviewed: ['Flood maps'], failed: [] })),
      updateEntity: jest.fn(() => of({}))
    };
    const modals = { open: jest.fn(() => of(sent)) };
    const toasts = { toast: jest.fn() };

    TestBed.configureTestingModule({
      imports: [ResearchCompetitionReviewComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { params: of({ guid: GUID }) } },
        { provide: UserSubmissionsService, useValue: service },
        { provide: SeasonService, useValue: {} },
        { provide: ModalService, useValue: modals },
        { provide: NotificationService, useValue: toasts }
      ]
    }).overrideComponent(ResearchCompetitionReviewComponent, {
      remove: { imports: [SubmissionFilesComponent] },
      add: { imports: [FilesStubComponent] }
    });

    const fixture = TestBed.createComponent(ResearchCompetitionReviewComponent);
    const router = TestBed.inject(Router);

    jest.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    component.form.patchValue({ acceptance: 'true', message: 'Booth 4.' });
    component.updateSubmission();

    return { service, modals, toasts, router };
  }

  it('shows the email first, then decides and sends the text approved', () => {
    const { service, modals, router } = open(templates);

    expect(modals.open).toHaveBeenCalledWith(
      ReviewEmailModalComponent,
      expect.objectContaining({ data: expect.objectContaining({ acceptance: true }) })
    );
    expect(service.previewReview).toHaveBeenCalledWith([GUID], true, 'Booth 4.');
    expect(service.review).toHaveBeenCalledWith([GUID], true, 'Booth 4.', templates);
    expect(service.updateEntity).not.toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/admin/research-competition']);
  });

  it('decides nothing and sends nothing when the window is cancelled', () => {
    const { service, toasts, router } = open(null);

    expect(service.review).not.toHaveBeenCalled();
    expect(service.updateEntity).not.toHaveBeenCalled();
    expect(toasts.toast).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
