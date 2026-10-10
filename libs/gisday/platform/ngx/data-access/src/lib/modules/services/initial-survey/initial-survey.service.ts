import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { InitialSurveyResponse, InitialSurveyQuestion } from '@tamu-gisc/gisday/platform/data-api';

import { BaseService } from '../_base/base.service';

@Injectable({
  providedIn: 'root'
})
export class InitialSurveyService extends BaseService<InitialSurveyResponse> {
  private env1: EnvironmentService;
  private http1: HttpClient;

  public resource: string;

  constructor() {
    const env1 = inject(EnvironmentService);
    const http1 = inject(HttpClient);

    super(env1, http1, 'initial-surveys');

    this.env1 = env1;
    this.http1 = http1;
  }

  public seeIfUserTookSurvey() {
    return this.http1.get<boolean>(`${this.resource}`);
  }

  public getInitialSurveyQuestions() {
    return this.http1.get<Array<Partial<InitialSurveyQuestion>>>(`${this.resource}/questions/all`);
  }
}
