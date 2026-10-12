import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
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
  private readonly fs = inject(FormService);

  public model: Observable<CompetitionSeason>;

  public ngOnInit() {
    this.model = this.fs.getFormForActiveSeason();
  }
}
