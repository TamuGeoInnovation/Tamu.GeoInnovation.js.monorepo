import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DeepPartial } from 'typeorm';
import { map } from 'rxjs/operators';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { CountyClaim, County } from '@tamu-gisc/covid/common/entities';

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

  public getAllUserCountyClaims(email) {
    return this.http.get<Array<Partial<CountyClaim>>>(`${this.resource}/claim/${email}`).pipe(
      map((claims) => {
        return claims.sort((a, b) => {
          return Date.parse(b.created as unknown as string) - Date.parse(a.created as unknown as string);
        });
      })
    );
  }

  public getActiveClaimsForUser(email: string) {
    return this.http.get<Partial<Array<CountyClaim>>>(`${this.resource}/claim/active/${email}`);
  }

  public getSuggestedClaims(stateFips: number) {
    return this.http.get<Array<County>>(`${this.resource}/suggested/${stateFips}/5`);
  }

  public getAdminClaims(stateFips: number, countyFips: number, email: string) {
    return this.http.post<Partial<Array<CountyClaim>>>(
      `${this.resource}/admin/claim`,
      {
        stateFips: stateFips,
        countyFips: countyFips,
        email: email
      },
      {
        withCredentials: true
      }
    );
  }

  public getClaimInfos(claimGuid: string) {
    return this.http.get<Partial<CountyClaim>>(`${this.resource}/admin/claim/${claimGuid}`, {
      withCredentials: true
    });
  }

  public registerClaim(claim: DeepPartial<CountyClaim>, phoneNumbers, websites) {
    return this.http.post<Partial<CountyClaim>>(`${this.resource}/claim`, { ...claim, phoneNumbers, websites });
  }

  public closeClaim(claimGuid: string) {
    return this.http.post<Partial<CountyClaim>>(`${this.resource}/close`, { guid: claimGuid });
  }
}
