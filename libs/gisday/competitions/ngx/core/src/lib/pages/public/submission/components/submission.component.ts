import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { CompetitionSeason } from '@tamu-gisc/gisday/competitions/data-api';
import { FormService } from '@tamu-gisc/gisday/competitions/ngx/data-access';

@Component({
  selector: 'tamu-gisc-submission-copmon',
  templateUrl: './submission.component.html',
  styleUrls: ['./submission.component.scss']
})
export class SubmissionComponent implements OnInit {
  public model: Observable<CompetitionSeason>;

  constructor(private readonly fs: FormService) {}

  public ngOnInit() {
    this.model = this.fs.getFormForActiveSeason();
  }
}
