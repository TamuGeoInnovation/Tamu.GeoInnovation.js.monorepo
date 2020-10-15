import { Component, OnInit } from '@angular/core';
import { InitialSurveyService } from '@tamu-gisc/gisday/data-access';
import { InitialSurveyQuestion } from '@tamu-gisc/gisday/data-api';
import { Observable } from 'rxjs';

@Component({
  selector: 'tamu-gisc-initial-survey',
  templateUrl: './initial-survey.component.html',
  styleUrls: ['./initial-survey.component.scss']
})
export class InitialSurveyComponent implements OnInit {
  public $initalSurveyQuestions: Observable<Array<Partial<InitialSurveyQuestion>>>;

  constructor(private readonly initialSurveyService: InitialSurveyService) {
    this.fetchSurveyQuestions();
  }

  public ngOnInit(): void {}

  public fetchSurveyQuestions() {
    this.$initalSurveyQuestions = this.initialSurveyService.getInitialSurveyQuestions();
    // this.initialSurveyService.getInitialSurveyQuestions().subscribe((results) => {
    //   console.log(results);
    // });
  }
}
