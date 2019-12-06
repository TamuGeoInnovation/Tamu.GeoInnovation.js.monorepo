import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

@Injectable({
  providedIn: 'root'
})
export class BaseApiService<T> {
  public api_url: string;

  /**
   * Base API service holds the base API url. The base resource path is provided by the
   * sub-class
   */
  public resource: string;

  constructor(private environment: EnvironmentService, private http: HttpClient) {
    this.api_url = this.environment.value('api_url');
  }

  public getData(endpoint?: string) {
    return this.http.get<Array<T>>(`${this.api_url}/${this.resource}${endpoint ? '/' + endpoint : ''}`);
  }
}
