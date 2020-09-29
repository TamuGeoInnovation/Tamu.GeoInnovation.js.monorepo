import { Component, OnInit } from '@angular/core';
import { Class } from '@tamu-gisc/gisday/data-api';
import { Observable } from 'rxjs';

@Component({
  selector: 'tamu-gisc-my-submissions',
  templateUrl: './my-submissions.component.html',
  styleUrls: ['./my-submissions.component.scss']
})
export class MySubmissionsComponent implements OnInit {
  public $vgiSubmissions: Observable<Array<Partial<any>>>;
  public $posterSubmissions: Observable<Array<Partial<any>>>;
  public $feedbackSubmissions: Observable<Array<Partial<any>>>;
  constructor() {}

  ngOnInit(): void {}
}
