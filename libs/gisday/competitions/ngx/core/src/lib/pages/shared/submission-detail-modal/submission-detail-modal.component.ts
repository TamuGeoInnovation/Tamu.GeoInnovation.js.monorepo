import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

import { SubmissionReviewDto, SubmissionMedia, VALIDATION_STATUS } from '@tamu-gisc/gisday/competitions/data-api';
import { ModalRef } from '@tamu-gisc/ui-kits/ngx/layout/modal';
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
    private readonly modalRef: ModalRef,
    private readonly submissionService: SubmissionService,
    private readonly sanitizer: DomSanitizer,
    private readonly settings: SettingsService,
    private readonly env: EnvironmentService,
    private readonly ns: NotificationService
  ) {
    this.submission = this.modalRef.config.data.submission;
    this.isAdmin = this.modalRef.config.data.isAdmin;
  }

  public ngOnInit(): void {
    // Load images for the submission
    this.images$ = this.submissionService.getSubmissionImages(this.submission.guid).pipe(
      map((images: SubmissionMedia[]) => {
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
          if (!userGuid) {
            throw new Error('User GUID not found');
          }
          return this.submissionService.validateSubmission({
            guid: this.submission.guid,
            status,
            userGuid
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
