import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { SubmissionType } from '@tamu-gisc/gisday/data-api';

import { BaseService } from '../_base/base.service';

@Injectable({
  providedIn: 'root'
})
export class SubmissionTypeService extends BaseService<SubmissionType> {
  public withCredentials = false;
  public resource: string;

  constructor(private env1: EnvironmentService, private http1: HttpClient) {
    // this.resource = this.env.value('api_url') + '/submission-type';
    super(env1, http1, 'submission-type');
  }
}
