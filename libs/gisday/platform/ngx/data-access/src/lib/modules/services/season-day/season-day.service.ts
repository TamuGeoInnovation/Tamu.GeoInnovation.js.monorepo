import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { SeasonDay, SimplifiedEvent } from '@tamu-gisc/gisday/platform/data-api';

import { BaseService } from '../_base/base.service';

@Injectable({
  providedIn: 'root'
})
export class SeasonDayService extends BaseService<SeasonDay> {
  private http1 = inject(HttpClient);

  constructor() {
    super('season-days');
  }

  public getDayEvents(guid: string) {
    return this.http1.get<Array<SimplifiedEvent>>(`${this.resource}/${guid}/events`);
  }
}
