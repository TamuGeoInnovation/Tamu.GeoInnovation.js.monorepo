import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { SubmissionReviewDto } from '@tamu-gisc/gisday/competitions/data-api/types';
import { SubmissionService } from '@tamu-gisc/gisday/competitions/ngx/data-access';
import { SubmissionReviewListComponent } from '../../../shared/submission-review-list/submission-review-list.component';

@Component({
  selector: 'tamu-gisc-user-submissions',
  templateUrl: './user-submissions.component.html',
  styleUrls: ['./user-submissions.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [SubmissionReviewListComponent]
})
export class UserSubmissionsComponent implements OnInit {
  private readonly submissionService = inject(SubmissionService);

  public submissions$: Observable<SubmissionReviewDto[]>;

  public ngOnInit(): void {
    // The API knows who is signed in (#1791). This used to read the account id from a setting only
    // the old standalone competitions app had, so on this site the page failed and showed nothing.
    this.submissions$ = this.submissionService.getMySubmissions();
  }
}
