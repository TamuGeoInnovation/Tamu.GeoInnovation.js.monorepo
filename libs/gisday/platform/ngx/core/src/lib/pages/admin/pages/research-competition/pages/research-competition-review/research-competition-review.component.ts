import { Component, OnInit, inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { filter, map, Observable, shareReplay, switchMap } from 'rxjs';

import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { Submission } from '@tamu-gisc/gisday/platform/data-api';
import { SeasonService, UserSubmissionsService, reviewSubmissionsToast } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { serverMessage, SubmissionFilesComponent, provideAdminDetailsPage } from '@tamu-gisc/gisday/platform/ngx/common';
import { SlideToggleComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { TextboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { ButtonComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { AsyncPipe, TitleCasePipe } from '@angular/common';

import { BaseAdminDetailsPageComponent } from '../../../base-admin-details-page/base-admin-details-page.component';
import {
  ReviewEmailModalComponent,
  ReviewEmailModalData,
  ReviewEmailModalResult
} from '@tamu-gisc/gisday/platform/ngx/common';

@Component({
  selector: 'tamu-gisc-research-competition-review',
  templateUrl: './research-competition-review.component.html',
  styleUrls: ['./research-competition-review.component.scss'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    SlideToggleComponent,
    TextboxComponent,
    ButtonComponent,
    AsyncPipe,
    TitleCasePipe,
    SubmissionFilesComponent
  ],
  providers: [provideAdminDetailsPage(() => ResearchCompetitionReviewComponent)]
})
export class ResearchCompetitionReviewComponent extends BaseAdminDetailsPageComponent implements OnInit {
  private readonly fb = inject(UntypedFormBuilder);
  private readonly at = inject(ActivatedRoute);
  private readonly submissionService = inject(UserSubmissionsService);
  private readonly ns = inject(NotificationService);
  private readonly ss = inject(SeasonService);
  private readonly modals = inject(ModalService);

  public entity$: Observable<Partial<Submission>>;
  public form: UntypedFormGroup;

  public reviewOptions = [
    {
      value: 'true',
      label: 'Accept'
    },
    {
      value: 'false',
      label: 'Reject'
    }
  ];

  protected override detailsForm() {
    return this.form;
  }

  public ngOnInit(): void {
    this.form = this.fb.group({
      guid: [''],
      acceptance: ['true'],
      message: ['']
    });

    this.entity$ = this.at.params.pipe(
      map((params) => params.guid),
      switchMap((guid) => this.submissionService.getEntity(guid)),
      shareReplay()
    );

    this.entity$.subscribe((entity) => {
      const acceptance = entity.acceptance.toString();

      this.form.patchValue({ guid: entity.guid, acceptance, message: entity.message });
    });
  }

  public deleteEntity() {
    this.submissionService.deleteEntity(this.form.getRawValue().guid).subscribe({
      next: () => {
        this.ns.toast({
          id: 'delete-submission-success',
          title: 'Delete Submission',
          message: 'Submission deleted successfully.'
        });

        this.backToList();
      },
      error: (err) => {
        this.ns.toast({
          id: 'delete-submission-error',
          title: 'Delete Submission',
          message: serverMessage(err, `Error deleting submission: ${err.status}`)
        });
      }
    });
  }

  /**
   * Submit Review: shows the email the decision will send, editable, and records the decision and sends it only on
   * Send (#2981). Cancel leaves the submission as it was.
   */
  public updateSubmission() {
    const rawValue = this.form.getRawValue();

    // `acceptance` has been coerced into a string. We need to convert it back to a boolean.
    const acceptance = rawValue.acceptance === 'true';
    const guids = [rawValue.guid];
    const data: ReviewEmailModalData = {
      acceptance,
      preview: this.submissionService.previewReview(guids, acceptance, rawValue.message)
    };

    this.modals
      .open<ReviewEmailModalResult>(ReviewEmailModalComponent, { data })
      .pipe(
        filter((templates): templates is Record<string, string> => !!templates),
        switchMap((templates) => this.submissionService.review(guids, acceptance, rawValue.message, templates))
      )
      .subscribe({
        next: (result) => {
          this.ns.toast(reviewSubmissionsToast(result, acceptance));

          if (result.reviewed.length) {
            // The decision is saved: leaving is not leaving unsaved changes (#2942).
            this.form.markAsPristine();
            this.backToList();
          }
        },
        error: (err) => {
          this.ns.toast({
            id: 'update-submission-error',
            title: 'Update Submission',
            message: serverMessage(err, `Error inserting submission review: ${err.status}`)
          });
        }
      });
  }
}
