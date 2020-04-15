import { Injectable } from '@angular/core';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { HttpClient } from '@angular/common/http';

import { County } from '@tamu-gisc/covid/common/entities';

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
}
