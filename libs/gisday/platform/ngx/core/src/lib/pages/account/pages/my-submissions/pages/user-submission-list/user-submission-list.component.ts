import { Component, OnInit } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';

import { Submission } from '@tamu-gisc/gisday/platform/data-api';
import { UserSubmissionsService } from '@tamu-gisc/gisday/platform/ngx/data-access';

@Component({
  selector: 'tamu-gisc-user-submission-list',
  templateUrl: './user-submission-list.component.html',
  styleUrls: ['./user-submission-list.component.scss']
})
export class UserSubmissionListComponent implements OnInit {
  public presentationSubmissions$: Observable<Array<Partial<Submission>>>;
  public reviewStatus$: Observable<SubmissionReviewStatus>;

  /**
   * In-component enum reference for the `SubmissionReviewStatus` enum for use in the template
   */
  public SubmissionReviewStatus = SubmissionReviewStatus;

  constructor(public readonly userSubmissionService: UserSubmissionsService) {}

  public ngOnInit() {
    this.presentationSubmissions$ = this.userSubmissionService.getPresentationsForActiveSeason().pipe(shareReplay(1));
  }
}

enum SubmissionReviewStatus {
  InReview = 'In Review',
  Accepted = 'Accepted',
  Rejected = 'Rejected'
}
