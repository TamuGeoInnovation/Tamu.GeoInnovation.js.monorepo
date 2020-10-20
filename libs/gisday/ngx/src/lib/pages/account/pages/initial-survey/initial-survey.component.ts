import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { InitialSurveyService } from '@tamu-gisc/gisday/data-access';
import { InitialSurveyQuestion } from '@tamu-gisc/gisday/data-api';
import { Observable, Subject } from 'rxjs';
import { debounceTime, map, takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'tamu-gisc-initial-survey',
  templateUrl: './initial-survey.component.html',
  styleUrls: ['./initial-survey.component.scss']
})
export class InitialSurveyComponent implements OnInit {
  public dataGroup: FormGroup;
  public $initalSurveyQuestions: Observable<Array<Partial<IInitialSurveyQuestionResponse>>>;
  private _$destroy: Subject<boolean> = new Subject();

  constructor(private fb: FormBuilder, private readonly initialSurveyService: InitialSurveyService) {}

  public ngOnInit(): void {
    this.dataGroup = this.fb.group({});
    this.fetchSurveyQuestions();
  }

  public ngOnDestroy() {
    this._$destroy.next();
    this._$destroy.complete();
  }

  public fetchSurveyQuestions() {
    this.$initalSurveyQuestions = (this.initialSurveyService.getInitialSurveyQuestions() as Observable<
      Array<Partial<IInitialSurveyQuestionResponse>>
    >).pipe(
      map((questions) => {
        return questions.map((question) => {
          if (question.questionType.type === 'multiple-option' || question.questionType.type === 'scale-normal') {
            const tokens = question.questionOptions.split('|');
            question.options = tokens.map((token) => {
              const value: IMulitpleOptions<string> = {
                value: token
              };
              return value;
            });
          }
          return question;
        });
      }),
      tap((questions) => {
        questions.forEach((question) => {
          const questionType = question.questionType.type;
          if (questionType === 'multiple-option') {
            this.dataGroup.addControl(question.guid, this.fb.control([]));
          } else {
            this.dataGroup.addControl(question.guid, this.fb.control(''));
          }
        });
        return;
      })
    );
  }

  public submitSurvey() {
    const value = this.dataGroup.getRawValue();
    this.initialSurveyService.createEntity(value);
  }
}

export interface IInitialSurveyQuestionResponse extends InitialSurveyQuestion {
  options?: IMulitpleOptions<string>[];
}

interface IMulitpleOptions<T> {
  value: T;
}
