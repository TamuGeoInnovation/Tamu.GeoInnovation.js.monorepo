import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

@Injectable({
  providedIn: 'root'
})
export class StrapiService {
  private resource: string;

  constructor(private http: HttpClient, private environment: EnvironmentService) {
    this.resource = this.environment.value(`api_url`);
  }

  public getPage(page: string, locale: string = 'en') {
    return this.http.get(`${this.resource}/${page}?_locale=${locale}`);
  }
}
