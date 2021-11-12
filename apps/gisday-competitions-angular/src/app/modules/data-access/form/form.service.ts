import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

@Injectable({
  providedIn: 'root'
})
export class FormService {
  public resource: string;

  constructor(private readonly http: HttpClient, private readonly env: EnvironmentService) {
    this.resource = `${this.env.value('api_url')}/form`;
  }

  public getFormForSeason(seasonName: string): Observable<SeasonForm> {
    // TODO: This is my best guess at an endpoint URL.
    return this.http.get<SeasonForm>(`${this.resource}/${seasonName}`);
  }

  public saveFormModelForSeason(seasonGuid: string, form: SeasonForm) {
    // TODO: This is my best guess at an endpoint URL.
    return this.http.post(`${this.resource}/${seasonGuid}`, form);
  }
}

export interface SeasonForm {
  source: string;
  model: Array<QuestionModel>;
}

export interface QuestionModel {
  attribute: string;
  title: string;
  instructions: string;
  enabled: boolean;
  options?: Array<{
    name: string;
    value: string | number | boolean;
  }>;
  type: string;
}
