import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { InitialSurveyResponse, InitialSurveyQuestion } from '@tamu-gisc/gisday/platform/data-api';

import { BaseService } from '../_base/base.service';

@Injectable({
  providedIn: 'root'
})
export class InitialSurveyService extends BaseService<InitialSurveyResponse> {
  private http1 = inject(HttpClient);

  public resource: string;

  constructor() {
    super('initial-surveys');
  }

  public seeIfUserTookSurvey() {
    return this.http1.get<boolean>(`${this.resource}`);
  }

  public getInitialSurveyQuestions() {
    return this.http1.get<Array<Partial<InitialSurveyQuestion>>>(`${this.resource}/questions/all`);
  }
}
