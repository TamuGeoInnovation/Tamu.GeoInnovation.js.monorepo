import { Pipe, PipeTransform } from '@angular/core';

import { Submission } from '@tamu-gisc/gisday/platform/data-api';

import { SUBMISSION_REVIEW_STATUS } from '../../enums/submission-review-status.enum';

@Pipe({
  name: 'submissionReviewStatus'
})
export class SubmissionReviewStatusPipe implements PipeTransform {
  public transform(value: Partial<Submission>): SUBMISSION_REVIEW_STATUS {
    if (!value) return null;

    if (value.reviewed === false) {
      return SUBMISSION_REVIEW_STATUS.InReview;
    }

    if (value.reviewed === true && value.acceptance === true) {
      return SUBMISSION_REVIEW_STATUS.Accepted;
    }

    if (value.reviewed === true && value.acceptance === false) {
      return SUBMISSION_REVIEW_STATUS.Rejected;
    }

    return SUBMISSION_REVIEW_STATUS.Unknown;
  }
}
