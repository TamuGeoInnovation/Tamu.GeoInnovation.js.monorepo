import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { Submission } from '@tamu-gisc/gisday/platform/data-api';

import { BaseService } from '../_base/base.service';

@Injectable({
  providedIn: 'root'
})
export class UserSubmissionsService extends BaseService<Submission> {
  public withCredentials = true;
  public resource: string;

  constructor(private env1: EnvironmentService, private http1: HttpClient) {
    super(env1, http1, 'user-submission');
  }

  public getPresentations() {
    return this.http1.get<Array<Partial<Submission>>>(`${this.resource}/presentations`);
  }

  public getPosters() {
    return this.http1.get<Array<Partial<Submission>>>(`${this.resource}/posters`);
  }
}
