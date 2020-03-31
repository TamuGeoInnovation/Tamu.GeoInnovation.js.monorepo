import { Injectable } from '@angular/core';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RestrictionsService {
  public resource: string;

  constructor(private env: EnvironmentService, private http: HttpClient) {
    this.resource = this.env.value('covid_api_url') + 'restrictions';
  }

  public getRestrictions() {
    return this.http.get(this.resource);
  }
}
