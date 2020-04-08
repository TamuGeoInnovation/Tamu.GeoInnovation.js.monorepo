import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { CountyClaim } from '@tamu-gisc/covid/common/entities';
import { DeepPartial } from 'typeorm';

@Injectable({
  providedIn: 'root'
})
export class CountyClaimsService {
  public resource: string;

  constructor(private env: EnvironmentService, private http: HttpClient) {
    this.resource = this.env.value('covid_api_url') + 'county-claims';
  }

  /**
   * Creates a new claim or creates new claim information if the claim already exists
   */
  public submitClaim() {
    // TODO: submit claim with numbers and websites
    debugger;
  }

  public getActiveClaimsForCounty(countyFips: number) {
    return this.http.get<Array<Partial<CountyClaim>>>(`${this.resource}/active/${countyFips}`);
  }

  public getActiveClaimsForUser(email: string) {
    return this.http.get<Partial<Array<CountyClaim>>>(`${this.resource}/claim/active/${email}`);
  }

  public registerClaim(claim: DeepPartial<CountyClaim>) {
    return this.http.post<Partial<CountyClaim>>(`${this.resource}/claim`, claim);
  }
}
