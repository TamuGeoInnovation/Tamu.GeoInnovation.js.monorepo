import { Component, OnInit } from '@angular/core';
import { UserSubmissionsService } from '@tamu-gisc/gisday/data-access';
import { UserSubmission } from '@tamu-gisc/gisday/data-api';
import { Observable } from 'rxjs';

@Component({
  selector: 'tamu-gisc-view-submission',
  templateUrl: './view-submission.component.html',
  styleUrls: ['./view-submission.component.scss']
})
export class ViewSubmissionComponent implements OnInit {
  public $vgiSubmissions: Observable<Array<Partial<any>>>;
  public $paperPosterSubmissions: Observable<Array<Partial<UserSubmission>>>;
  public $feedbackSubmissions: Observable<Array<Partial<any>>>;

  constructor(public readonly userSubmissionService: UserSubmissionsService) {
    this.fetchPaperPosterSubmissions();
  }

  ngOnInit(): void {}

  public fetchPaperPosterSubmissions() {
    this.$paperPosterSubmissions = this.userSubmissionService.getEntities();
    // this.userSubmissionService.getEntities().subscribe((result) => {
    //   console.log(result);
    // });
  }
}
