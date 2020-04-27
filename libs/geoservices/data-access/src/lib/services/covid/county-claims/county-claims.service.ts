import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { CountyClaim, County } from '@tamu-gisc/covid/common/entities';
import { DeepPartial } from 'typeorm';

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

  public getHistoricClaimsForCounty(countyFips: number) {
    return this.http.get<Array<Partial<CountyClaim>>>(`${this.resource}/county/${countyFips}/1`);
  }

  public getActiveClaimsForUser(email: string) {
    return this.http.get<Partial<Array<CountyClaim>>>(`${this.resource}/claim/active/${email}`);
  }

  public getSuggestedClaims(stateFips: number) {
    return this.http.get<Array<County>>(`${this.resource}/suggested/${stateFips}`);
  }

  public registerClaim(claim: DeepPartial<CountyClaim>, phoneNumbers, websites) {
    return this.http.post<Partial<CountyClaim>>(`${this.resource}/claim`, { ...claim, phoneNumbers, websites });
  }

  public closeClaim(claimGuid: string) {
    return this.http.post<Partial<CountyClaim>>(`${this.resource}/close`, { guid: claimGuid });
  }
}
