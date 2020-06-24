import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { EntityValue } from '@tamu-gisc/covid/common/entities';

@Injectable({
  providedIn: 'root'
})
export class WebsitesService {
  public resource: string;

  constructor(private env: EnvironmentService, private http: HttpClient) {
    this.resource = this.env.value('covid_api_url') + 'websites';
  }

  public getWebsitesForCounty(countyFips: number) {
    return this.http.get<Partial<Array<EntityValue>>>(`${this.resource}/county/${countyFips}`);
  }

  public setWebsitesForCounty(websites: EntityValue[], countyFips: number) {
    return this.http.post<Array<EntityValue>>(`${this.resource}/county`, { websites, countyFips });
  }

  public getWebsitesForClaimInfo(guid: string) {
    return this.http.get<Array<EntityValue>>(`${this.resource}/claim/info/${guid}`);
  }
}
