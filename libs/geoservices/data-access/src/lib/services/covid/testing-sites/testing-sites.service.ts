import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { CountyClaim, TestingSiteInfo, Location } from '@tamu-gisc/covid/common/entities';
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

  public getTestingSitesForCounty(countyFips: number) {
    return this.http.get<Array<Partial<FormattedTestingSite>>>(`${this.resource}/county/${countyFips}`);
  }

  public getTestingSitesSortedByCounty() {
    return this.http.get<Array<Partial<FormattedTestingSite>>>(`${this.resource}/county`);
  }

  public registerCountyAsTestingSiteLess(countyFips: number) {
    return this.http.post(`${this.resource}/siteless`, { countyFips: countyFips });
  }
}

export interface FormattedTestingSite {
  claim: CountyClaim;
  info: TestingSiteInfo;
  location: Location;
}
