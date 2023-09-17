import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { CheckIn } from '@tamu-gisc/gisday/platform/data-api';

import { BaseService } from '../_base/base.service';

@Injectable({
  providedIn: 'root'
})
export class CheckinService extends BaseService<CheckIn> {
  public resource: string;

  constructor(private env1: EnvironmentService, private http1: HttpClient) {
    super(env1, http1, 'check-ins');
  }

  public insertUserCheckin(eventGuid: string) {
    return this.http1
      .post(`${this.resource}/user`, {
        eventGuid: eventGuid
      })
      .subscribe((result) => {
        console.log(result);
      });
  }
}
