import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { pluck } from 'rxjs/operators';

import { FormService, SeasonForm } from '../../../../modules/data-access/form/form.service';

@Component({
  selector: 'tamu-gisc-submission-copmon',
  templateUrl: './submission.component.html',
  styleUrls: ['./submission.component.scss']
})
export class SubmissionComponent implements OnInit {
  public model: Observable<SeasonForm['model']>;

  constructor(private readonly fs: FormService) {}

  public ngOnInit() {
    const year = new Date().getFullYear().toString();
    this.model = this.fs.getFormForSeason(year).pipe(pluck('model'));
  }
}
