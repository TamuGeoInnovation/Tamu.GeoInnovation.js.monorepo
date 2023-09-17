import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { InitialSurveyResponse, InitialSurveyQuestion } from '@tamu-gisc/gisday/platform/data-api';

import { BaseService } from '../_base/base.service';

@Injectable({
  providedIn: 'root'
})
export class InitialSurveyService extends BaseService<InitialSurveyResponse> {
  public resource: string;

  constructor(private env1: EnvironmentService, private http1: HttpClient) {
    super(env1, http1, 'initial-surveys');
  }

  public seeIfUserTookSurvey() {
    return this.http1.get<boolean>(`${this.resource}`, {
      headers: this.headers
    });
  }

  public getInitialSurveyQuestions() {
    return this.http1.get<Array<Partial<InitialSurveyQuestion>>>(`${this.resource}/questions/all`, {
      headers: this.headers
    });
  }
}
