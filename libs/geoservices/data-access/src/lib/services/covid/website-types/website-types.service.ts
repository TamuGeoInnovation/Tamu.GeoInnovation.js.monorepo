import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { WebsiteType } from '@tamu-gisc/covid/common/entities';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

@Injectable({
  providedIn: 'root'
})
export class WebsiteTypesService {
  public resource: string;

  constructor(private env: EnvironmentService, private http: HttpClient) {
    this.resource = this.env.value('covid_api_url') + 'website-types';
  }

  public getWebsiteTypes() {
    return this.http.get<Array<WebsiteType>>(this.resource);
  }
}
