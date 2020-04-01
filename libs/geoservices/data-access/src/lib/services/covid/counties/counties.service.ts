import { Injectable } from '@angular/core';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { HttpClient } from '@angular/common/http';

import { County, User } from '@tamu-gisc/covid/common/entities';

@Injectable({
  providedIn: 'root'
})
export class CountiesService {
  public resource: string;

  constructor(private env: EnvironmentService, private http: HttpClient) {
    this.resource = this.env.value('covid_api_url') + 'counties';
  }

  public getCountiesForState(stateFips: number) {
    return this.http.get<Array<County>>(`${this.resource}/state/${stateFips}`);
  }

  public registerUserToCounty(email: string, countyFips: number) {
    return this.http.post<Partial<User>>(`${this.resource}/claim`, { email, countyFips });
  }

  public getClaimsForUser(email: string) {
    return this.http.get<Partial<User>>(`${this.resource}/claim/${email}`);
  }
}
