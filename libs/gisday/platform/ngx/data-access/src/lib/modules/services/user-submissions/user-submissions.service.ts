import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { Submission } from '@tamu-gisc/gisday/platform/data-api';

import { BaseService } from '../_base/base.service';

@Injectable({
  providedIn: 'root'
})
export class UserSubmissionsService extends BaseService<Submission> {
  private env1: EnvironmentService;
  private http1: HttpClient;

  public withCredentials = true;
  public resource: string;

  constructor() {
    const env1 = inject(EnvironmentService);
    const http1 = inject(HttpClient);

    super(env1, http1, 'user-submissions');

    this.env1 = env1;
    this.http1 = http1;
  }

  public getPresentationsForActiveSeason() {
    return this.http1.get<Array<Partial<Submission>>>(`${this.resource}/me`);
  }

  public getPosters() {
    return this.http1.get<Array<Partial<Submission>>>(`${this.resource}/posters`);
  }
}
