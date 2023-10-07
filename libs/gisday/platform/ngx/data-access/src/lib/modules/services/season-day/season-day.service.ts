import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { SeasonDay, SimplifiedEvent } from '@tamu-gisc/gisday/platform/data-api';

import { BaseService } from '../_base/base.service';

@Injectable({
  providedIn: 'root'
})
export class SeasonDayService extends BaseService<SeasonDay> {
  constructor(private env1: EnvironmentService, private http1: HttpClient) {
    super(env1, http1, 'season-days');
  }

  public getDayEvents(guid: string) {
    return this.http1.get<Array<SimplifiedEvent>>(`${this.resource}/${guid}/events`);
  }
}
