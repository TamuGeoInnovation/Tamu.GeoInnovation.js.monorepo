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
  public override resource: string;

  constructor(private env1: EnvironmentService, private http1: HttpClient) {
    super(env1, http1, 'user-submissions');
  }

  public getPresentationsForActiveSeason() {
    return this.http1.get<Array<Partial<Submission>>>(`${this.resource}/me`);
  }

  public getPosters() {
    return this.http1.get<Array<Partial<Submission>>>(`${this.resource}/posters`);
  }
}
