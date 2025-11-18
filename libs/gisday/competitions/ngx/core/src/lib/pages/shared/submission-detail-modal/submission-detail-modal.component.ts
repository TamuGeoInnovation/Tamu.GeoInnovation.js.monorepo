import { Component, Inject, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

import { SubmissionReviewDto, SubmissionMediaDto, VALIDATION_STATUS } from '@tamu-gisc/gisday/competitions/data-api/types';
import { MODAL_DATA, ModalRefService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { SubmissionService } from '@tamu-gisc/gisday/competitions/ngx/data-access';
import { SettingsService } from '@tamu-gisc/common/ngx/settings';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

@Component({
  selector: 'tamu-gisc-submission-detail-modal',
  templateUrl: './submission-detail-modal.component.html',
  styleUrls: ['./submission-detail-modal.component.scss']
})
export class SubmissionDetailModalComponent implements OnInit {
  public submission: SubmissionReviewDto;
  public isAdmin = false;
  public images$: Observable<Array<{ guid: string; url: SafeUrl }>>;
  public VALIDATION_STATUS = VALIDATION_STATUS;

  constructor(
    @Inject(MODAL_DATA) private readonly data: SubmissionDetailModalData,
    private readonly modalRef: ModalRefService,
    private readonly submissionService: SubmissionService,
    private readonly sanitizer: DomSanitizer,
    private readonly settings: SettingsService,
    private readonly env: EnvironmentService,
    private readonly ns: NotificationService
  ) {
    this.submission = this.data.submission;
    this.isAdmin = this.data.isAdmin;
  }

  public ngOnInit(): void {
    // Load images for the submission
    this.images$ = this.submissionService.getSubmissionImages(this.submission.guid).pipe(
      map((images: SubmissionMediaDto[]) => {
        return images.map((img) => ({
          guid: img.guid,
          url: this.createImageUrl(img.blob)
        }));
      })
    );
  }

  public setValidationStatus(status: VALIDATION_STATUS): void {
    this.settings
      .getSimpleSettingsBranch(this.env.value('LocalStoreSettings').subKey)
      .pipe(
        map((settings) => settings?.guid),
        switchMap((userGuid) => {
          if (!userGuid || typeof userGuid !== 'string') {
            throw new Error('User GUID not found');
          }
          return this.submissionService.validateSubmission({
            guid: this.submission.guid,
            status,
            userGuid: userGuid as string
          });
        }),
        tap(() => {
          this.submission.validationStatus = status;
          this.ns.toast({
            id: 'validation-success',
            title: 'Success',
            message: 'Submission validation status updated successfully'
          });
          this.modalRef.close(this.submission);
        })
      )
      .subscribe({
        error: (err) => {
          this.ns.toast({
            id: 'validation-error',
            title: 'Error',
            message: `Failed to update validation status: ${err.message}`
          });
        }
      });
  }

  public close(): void {
    this.modalRef.close();
  }

  private createImageUrl(blob: Blob): SafeUrl {
    if (blob) {
      const urlCreator = window.URL || window.webkitURL;
      const imageUrl = urlCreator.createObjectURL(blob);
      return this.sanitizer.bypassSecurityTrustUrl(imageUrl);
    }
    return '';
  }
}

export interface SubmissionDetailModalData {
  submission: SubmissionReviewDto;
  isAdmin: boolean;
}
