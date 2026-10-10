import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { SubmissionReviewDto } from '@tamu-gisc/gisday/competitions/data-api/types';
import { SubmissionService } from '@tamu-gisc/gisday/competitions/ngx/data-access';
import { SettingsService } from '@tamu-gisc/common/ngx/settings';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
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
  private readonly settings = inject(SettingsService);
  private readonly env = inject(EnvironmentService);

  public submissions$: Observable<SubmissionReviewDto[]>;

  public ngOnInit(): void {
    this.submissions$ = this.settings.getSimpleSettingsBranch(this.env.value('LocalStoreSettings').subKey).pipe(
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
