import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { InitialSurveyResponse, InitialSurveyQuestion } from '@tamu-gisc/gisday/data-api';

import { BaseService } from '../_base/base.service';

@Injectable({
  providedIn: 'root'
})
export class InitialSurveyService extends BaseService<InitialSurveyResponse> {
  public withCredentials = true;
  public resource: string;

  constructor(private env1: EnvironmentService, private http1: HttpClient) {
    super(env1, http1, 'initial-survey', true);
  }

  public seeIfUserTookSurvey() {
    return this.http1.get<boolean>(`${this.resource}`, {
      withCredentials: true
    });
  }

  public getInitialSurveyQuestions() {
    return this.http1.get<Array<Partial<InitialSurveyQuestion>>>(`${this.resource}/questions/all`, {
      withCredentials: true
    });
  }
}
