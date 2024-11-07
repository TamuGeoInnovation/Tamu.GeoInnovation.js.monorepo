import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { Submission } from '@tamu-gisc/gisday/platform/data-api';
import { UserSubmissionsService } from '@tamu-gisc/gisday/platform/ngx/data-access';

@Component({
  selector: 'tamu-gisc-user-submission-list',
  templateUrl: './user-submission-list.component.html',
  styleUrls: ['./user-submission-list.component.scss']
})
export class UserSubmissionListComponent implements OnInit {
  public presentationSubmissions$: Observable<Array<Partial<Submission>>>;

  constructor(public readonly userSubmissionService: UserSubmissionsService) {}

  public ngOnInit() {
    this.presentationSubmissions$ = this.userSubmissionService.getPresentationsForActiveSeason();
  }
}
