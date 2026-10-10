import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Submission } from '@tamu-gisc/gisday/platform/data-api';

import { BaseService } from '../_base/base.service';

@Injectable({
  providedIn: 'root'
})
export class UserSubmissionsService extends BaseService<Submission> {
  private http1 = inject(HttpClient);

  public withCredentials = true;
  public resource: string;

  constructor() {
    super('user-submissions');
  }

  public getPresentationsForActiveSeason() {
    return this.http1.get<Array<Partial<Submission>>>(`${this.resource}/me`);
  }

  public getPosters() {
    return this.http1.get<Array<Partial<Submission>>>(`${this.resource}/posters`);
  }
}
