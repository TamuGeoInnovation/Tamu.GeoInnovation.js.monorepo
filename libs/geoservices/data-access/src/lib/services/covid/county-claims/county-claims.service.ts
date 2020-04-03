import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { CountyClaim } from '@tamu-gisc/covid/common/entities';

@Injectable({
  providedIn: 'root'
})
export class CountyClaimsService {
  public resource: string;

  constructor(private env: EnvironmentService, private http: HttpClient) {
    this.resource = this.env.value('covid_api_url') + 'county-claims';
  }

  public getActiveClaimsForCounty(countyFips: number) {
    return this.http.get<Array<Partial<CountyClaim>>>(`${this.resource}/active/${countyFips}`);
  }
}
