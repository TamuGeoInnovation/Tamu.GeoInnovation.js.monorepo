import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { SeasonService, UserSubmissionsService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { SubmissionFilesComponent } from '@tamu-gisc/gisday/platform/ngx/common';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { ReviewEmailModalComponent } from '@tamu-gisc/gisday/platform/ngx/common';
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
      previewReview: vi.fn(() => of({ groups: [] })),
      review: vi.fn(() => of({ reviewed: ['Flood maps'], failed: [] })),
      updateEntity: vi.fn(() => of({}))
    };
    const modals = { open: vi.fn(() => of(sent)), isOpen: of(false) };
    const toasts = { toast: vi.fn() };

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
    const component = fixture.componentInstance;
    // Where it goes back to, the list it was opened from, is back-to-list-after-save.spec.ts's business (#2965).
    const backToList = vi.spyOn(component, 'backToList').mockImplementation(() => undefined);

    fixture.detectChanges();

    component.form.patchValue({ acceptance: 'true', message: 'Booth 4.' });
    component.updateSubmission();

    return { service, modals, toasts, backToList };
  }

  it('shows the email first, then decides and sends the text approved', () => {
    const { service, modals, backToList } = open(templates);

    expect(modals.open).toHaveBeenCalledWith(
      ReviewEmailModalComponent,
      expect.objectContaining({ data: expect.objectContaining({ acceptance: true }) })
    );
    expect(service.previewReview).toHaveBeenCalledWith([GUID], true, 'Booth 4.');
    expect(service.review).toHaveBeenCalledWith([GUID], true, 'Booth 4.', templates);
    expect(service.updateEntity).not.toHaveBeenCalled();
    expect(backToList).toHaveBeenCalledTimes(1);
  });

  it('decides nothing and sends nothing when the window is cancelled', () => {
    const { service, toasts, backToList } = open(null);

    expect(service.review).not.toHaveBeenCalled();
    expect(service.updateEntity).not.toHaveBeenCalled();
    expect(toasts.toast).not.toHaveBeenCalled();
    expect(backToList).not.toHaveBeenCalled();
  });
});

/** #3627: a submission read without its acceptance opens as not accepted, the column's default, rather than failing. */
describe('ResearchCompetitionReviewComponent, a submission without its acceptance', () => {
  it('shows it as not accepted', () => {
    const GUID = '0f8c9a52-1b2c-4d3e-8f4a-5b6c7d8e9f02';

    TestBed.configureTestingModule({
      imports: [ResearchCompetitionReviewComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { params: of({ guid: GUID }) } },
        {
          provide: UserSubmissionsService,
          useValue: { getEntity: () => of({ guid: GUID, title: 'Flood maps', message: 'Booth 4.', participants: [] }) }
        },
        { provide: SeasonService, useValue: {} },
        { provide: ModalService, useValue: { open: vi.fn(), isOpen: of(false) } },
        { provide: NotificationService, useValue: { toast: vi.fn() } }
      ]
    }).overrideComponent(ResearchCompetitionReviewComponent, {
      remove: { imports: [SubmissionFilesComponent] },
      add: { imports: [FilesStubComponent] }
    });

    const fixture = TestBed.createComponent(ResearchCompetitionReviewComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.form.getRawValue()).toEqual(
      expect.objectContaining({ guid: GUID, acceptance: 'false', message: 'Booth 4.' })
    );
  });
});
