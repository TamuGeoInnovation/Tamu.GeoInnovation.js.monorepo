import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { IStrapiPageResponse, StrapiSingleTypes, IStrapiStapleFooter, IStrapiStapleNavigation } from '../types/types';

@Injectable({
  providedIn: 'root'
})
export class StrapiService {
  private resource: string;

  constructor(private http: HttpClient, private environment: EnvironmentService) {
    this.resource = this.environment.value(`api_url`);
  }

  public getPage(type: StrapiSingleTypes, locale: string = 'en') {
    return this.http.get<IStrapiPageResponse>(`${this.resource}/${type}?_locale=${locale}`);
  }

  public getNavigation(type: StrapiSingleTypes = 'navigation', locale: string = 'en') {
    return this.http.get<IStrapiStapleNavigation>(`${this.resource}/${type}?_locale=${locale}`);
  }

  public getFooter(type: StrapiSingleTypes = 'footer', locale: string = 'en') {
    return this.http.get<IStrapiStapleFooter>(`${this.resource}/${type}?_locale=${locale}`);
  }
}
