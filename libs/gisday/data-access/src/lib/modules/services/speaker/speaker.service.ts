import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { Speaker } from '@tamu-gisc/gisday/data-api';

import { BaseService } from '../_base/base.service';

@Injectable({
  providedIn: 'root'
})
export class SpeakerService extends BaseService<Speaker> {
  public withCredentials = false;
  public resource: string;

  constructor(private env1: EnvironmentService, private http1: HttpClient) {
    super(env1, http1, 'speaker');
  }

  public getPresenter(guid: string) {
    return this.http1.get<Partial<Speaker>>(`${this.resource}/presenter/${guid}`, {
      withCredentials: false
    });
  }

  public getPresenters() {
    return this.http1.get<Array<Partial<Speaker>>>(`${this.resource}/presenters`, {
      withCredentials: false
    });
  }
}
