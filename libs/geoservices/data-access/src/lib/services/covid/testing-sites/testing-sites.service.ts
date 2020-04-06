import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { TestingSite } from '@tamu-gisc/covid/common/entities';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

@Injectable({
  providedIn: 'root'
})
export class TestingSitesService {
  public resource: string;

  constructor(private env: EnvironmentService, private http: HttpClient) {
    this.resource = this.env.value('covid_api_url') + 'sites';
  }

  public submitSite(payload) {
    return this.http.post(this.resource, payload);
  }

  public getTestingSitesForCounty(state: string, county: string) {
    return this.http.get<Array<Partial<TestingSite>>>(`${this.resource}/${state}/${county}`);
  }
}
