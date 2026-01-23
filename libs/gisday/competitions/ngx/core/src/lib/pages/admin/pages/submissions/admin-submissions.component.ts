import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { SubmissionReviewDto } from '@tamu-gisc/gisday/competitions/data-api/types';
import { SubmissionService } from '@tamu-gisc/gisday/competitions/ngx/data-access';

@Component({
  selector: 'tamu-gisc-admin-submissions',
  templateUrl: './admin-submissions.component.html',
  styleUrls: ['./admin-submissions.component.scss']
})
export class AdminSubmissionsComponent implements OnInit {
  public submissions$: Observable<SubmissionReviewDto[]>;

  constructor(private readonly submissionService: SubmissionService) {}

  public ngOnInit(): void {
    this.submissions$ = this.submissionService.getAdminSubmissions();
  }
}
