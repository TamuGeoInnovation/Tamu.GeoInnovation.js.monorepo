import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

@Injectable({
  providedIn: 'root'
})
export class VgiService {
  public resource: string;

  constructor(private env: EnvironmentService, private http: HttpClient, private route: string) {
    this.resource = this.env.value('api_url') + `/${route}`;
  }

  public getUrl(competition: string) {
    return `https://gisday.tamu.edu/rest/${competition}/Get/Submissions/?geoJSON=true`;
  }

  public getStormwater() {
    return this.http.get(this.getUrl('Stormwater'));
  }

  public getSignage() {
    return this.http.get(this.getUrl('Signage'));
  }

  public getSidewalks() {
    return this.http.get(this.getUrl('Sidewalks'));
  }

  public getManholes() {
    return this.http.get('https://gisday.tamu.edu/rest/Manhole/Get/?geoJSON=true');
  }
}
