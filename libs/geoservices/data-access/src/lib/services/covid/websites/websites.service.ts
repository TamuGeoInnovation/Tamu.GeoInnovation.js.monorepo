import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
// import { Website } from '@tamu-gisc/covid/common/entities';

@Injectable({
  providedIn: 'root'
})
export class WebsitesService {
  public resource: string;

  constructor(private env: EnvironmentService, private http: HttpClient) {
    this.resource = this.env.value('covid_api_url') + 'websites';
  }

  // public getWebsitesForCounty(countyFips: number) {
  //   return this.http.get<Partial<Array<Website>>>(`${this.resource}/county/${countyFips}`);
  // }

  // public setWebsitesForCounty(websites: Website[], countyFips: number) {
  //   return this.http.post<Array<Website>>(`${this.resource}/county`, { websites, countyFips });
  // }
}
