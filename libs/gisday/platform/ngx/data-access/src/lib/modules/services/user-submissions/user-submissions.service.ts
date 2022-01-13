import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { UserSubmission } from '@tamu-gisc/gisday/data-api';

import { BaseService } from '../_base/base.service';

@Injectable({
  providedIn: 'root'
})
export class UserSubmissionsService extends BaseService<UserSubmission> {
  public withCredentials = true;
  public resource: string;

  constructor(private env1: EnvironmentService, private http1: HttpClient) {
    super(env1, http1, 'user-submission', true);
  }
}
