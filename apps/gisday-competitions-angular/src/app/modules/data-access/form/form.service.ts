import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { pluck } from 'rxjs/operators';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { CompetitionForm, CompetitionSeason } from '@tamu-gisc/gisday/competitions';

@Injectable({
  providedIn: 'root'
})
export class FormService {
  public resource: string;

  constructor(private readonly http: HttpClient, private readonly env: EnvironmentService) {
    this.resource = `${this.env.value('api_url')}/form`;
  }

  public getFormForSeason(seasonName: string): Observable<CompetitionForm> {
    return this.http.get<CompetitionSeason>(`${this.resource}/${seasonName}`).pipe(pluck('form'));
  }

  public saveFormModelForSeason(seasonGuid: string, form: CompetitionForm) {
    return this.http.post(`${this.resource}/${seasonGuid}`, form);
  }
}
