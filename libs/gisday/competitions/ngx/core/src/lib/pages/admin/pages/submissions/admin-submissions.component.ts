import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { SubmissionReviewDto } from '@tamu-gisc/gisday/competitions/data-api/types';
import { SubmissionService } from '@tamu-gisc/gisday/competitions/ngx/data-access';
import { SubmissionReviewListComponent } from '../../../shared/submission-review-list/submission-review-list.component';

@Component({
  selector: 'tamu-gisc-admin-submissions',
  templateUrl: './admin-submissions.component.html',
  styleUrls: ['./admin-submissions.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [SubmissionReviewListComponent]
})
export class AdminSubmissionsComponent implements OnInit {
  private readonly submissionService = inject(SubmissionService);

  public submissions$: Observable<SubmissionReviewDto[]>;

  public ngOnInit(): void {
    this.submissions$ = this.submissionService.getAdminSubmissions();
  }
}
