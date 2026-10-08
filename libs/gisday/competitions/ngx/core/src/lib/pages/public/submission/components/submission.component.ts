import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';

import { CompetitionSeason } from '@tamu-gisc/gisday/competitions/data-api';
import { FormService } from '@tamu-gisc/gisday/competitions/ngx/data-access';
import { SubmissionComponent as SubmissionComponent_1 } from '@tamu-gisc/gisday/competitions/ngx/common';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'tamu-gisc-submission-complete',
    templateUrl: './submission.component.html',
    styleUrls: ['./submission.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [SubmissionComponent_1, AsyncPipe]
})
export class SubmissionComponent implements OnInit {
  public model: Observable<CompetitionSeason>;

  constructor(private readonly fs: FormService) {}

  public ngOnInit() {
    this.model = this.fs.getFormForActiveSeason();
  }
}
