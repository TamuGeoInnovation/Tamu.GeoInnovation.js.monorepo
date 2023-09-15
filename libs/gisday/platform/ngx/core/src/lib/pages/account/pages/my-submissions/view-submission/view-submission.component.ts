import { Component, OnInit } from '@angular/core';
import { UserSubmissionsService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { Submission } from '@tamu-gisc/gisday/platform/data-api';
import { Observable } from 'rxjs';

@Component({
  selector: 'tamu-gisc-view-submission',
  templateUrl: './view-submission.component.html',
  styleUrls: ['./view-submission.component.scss']
})
export class ViewSubmissionComponent implements OnInit {
  // TODO: Add in VGI submission count -Aaron (1/5/2021)
  // public $vgiSubmissions: Observable<Array<Partial<any>>>;
  public $paperPosterSubmissions: Observable<Array<Partial<Submission>>>;
  // TODO: Add in feedback submission count -Aaron (1/5/2021)
  // public $feedbackSubmissions: Observable<Array<Partial<any>>>;

  constructor(public readonly userSubmissionService: UserSubmissionsService) {}

  public ngOnInit() {
    this.fetchPaperPosterSubmissions();
  }

  public fetchPaperPosterSubmissions() {
    this.$paperPosterSubmissions = this.userSubmissionService.getEntities();
  }
}
