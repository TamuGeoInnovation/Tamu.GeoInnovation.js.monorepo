import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { SubmissionReviewDto } from '@tamu-gisc/gisday/competitions/data-api/types';
import { SubmissionService } from '@tamu-gisc/gisday/competitions/ngx/data-access';
import { SettingsService } from '@tamu-gisc/common/ngx/settings';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

@Component({
  selector: 'tamu-gisc-user-submissions',
  templateUrl: './user-submissions.component.html',
  styleUrls: ['./user-submissions.component.scss']
})
export class UserSubmissionsComponent implements OnInit {
  public submissions$: Observable<SubmissionReviewDto[]>;

  constructor(
    private readonly submissionService: SubmissionService,
    private readonly settings: SettingsService,
    private readonly env: EnvironmentService
  ) {}

  public ngOnInit(): void {
    this.submissions$ = this.settings
      .getSimpleSettingsBranch(this.env.value('LocalStoreSettings').subKey)
      .pipe(
        switchMap((settings) => {
          const userGuid = settings?.guid;
          if (!userGuid || typeof userGuid !== 'string') {
            throw new Error('User GUID not found');
          }
          return this.submissionService.getUserSubmissions(userGuid as string);
        })
      );
  }
}
