import { Component, OnInit } from '@angular/core';
import { Class } from '@tamu-gisc/gisday/data-api';
import { Observable } from 'rxjs';

@Component({
  selector: 'tamu-gisc-view-submission',
  templateUrl: './view-submission.component.html',
  styleUrls: ['./view-submission.component.scss']
})
export class ViewSubmissionComponent implements OnInit {
  public $vgiSubmissions: Observable<Array<Partial<any>>>;
  public $posterSubmissions: Observable<Array<Partial<any>>>;
  public $feedbackSubmissions: Observable<Array<Partial<any>>>;
  constructor() {}

  ngOnInit(): void {}
}
