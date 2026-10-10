import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { SeasonDay, SimplifiedEvent } from '@tamu-gisc/gisday/platform/data-api';

import { BaseService } from '../_base/base.service';

@Injectable({
  providedIn: 'root'
})
export class SeasonDayService extends BaseService<SeasonDay> {
  private env1: EnvironmentService;
  private http1: HttpClient;

  constructor() {
    const env1 = inject(EnvironmentService);
    const http1 = inject(HttpClient);

    super(env1, http1, 'season-days');

    this.env1 = env1;
    this.http1 = http1;
  }

  public getDayEvents(guid: string) {
    return this.http1.get<Array<SimplifiedEvent>>(`${this.resource}/${guid}/events`);
  }
}
