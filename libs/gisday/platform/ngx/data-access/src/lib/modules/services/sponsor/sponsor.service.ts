import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { Sponsor } from '@tamu-gisc/gisday/data-api';

import { BaseService } from '../_base/base.service';

@Injectable({
  providedIn: 'root'
})
export class SponsorService extends BaseService<Sponsor> {
  public withCredentials = false;
  public resource: string;

  constructor(private env1: EnvironmentService, private http1: HttpClient) {
    super(env1, http1, 'sponsor');
  }
}
