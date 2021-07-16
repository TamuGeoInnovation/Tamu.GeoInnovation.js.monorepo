import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { IStrapiPageResponse, StrapiLocales, StrapiPages } from '../types/types';

@Injectable({
  providedIn: 'root'
})
export class StrapiService {
  private resource: string;

  constructor(private http: HttpClient, private environment: EnvironmentService) {
    this.resource = this.environment.value(`api_url`);
  }

  public getPage(page: StrapiPages, locale: string = 'en') {
    return this.http.get<IStrapiPageResponse>(`${this.resource}/${page}?_locale=${locale}`);
  }
}
