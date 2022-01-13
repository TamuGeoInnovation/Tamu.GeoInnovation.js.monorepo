import { Component, OnInit } from '@angular/core';
import { UserSubmissionsService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { UserSubmission } from '@tamu-gisc/gisday/platform/data-api';
import { Observable } from 'rxjs';

@Component({
  selector: 'tamu-gisc-view-submission',
  templateUrl: './view-submission.component.html',
  styleUrls: ['./view-submission.component.scss']
})
export class ViewSubmissionComponent implements OnInit {
  // TODO: Add in VGI submission count -Aaron (1/5/2021)
  // public $vgiSubmissions: Observable<Array<Partial<any>>>;
  public $paperPosterSubmissions: Observable<Array<Partial<UserSubmission>>>;
  // TODO: Add in feedback submission count -Aaron (1/5/2021)
  // public $feedbackSubmissions: Observable<Array<Partial<any>>>;

  constructor(public readonly userSubmissionService: UserSubmissionsService) {
    this.fetchPaperPosterSubmissions();
  }

  public ngOnInit(): void {}

  public fetchPaperPosterSubmissions() {
    this.$paperPosterSubmissions = this.userSubmissionService.getEntities();
  }
}
