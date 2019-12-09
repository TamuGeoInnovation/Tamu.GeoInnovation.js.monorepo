import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Sites } from '@tamu-gisc/two/common';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { BaseApiService } from '../base-api/base-api.service';

@Injectable({
  providedIn: 'root'
})
export class SitesService extends BaseApiService<Sites> {
  constructor(private e: EnvironmentService, private h: HttpClient) {
    super(e, h);

    this.resource = 'sites';
  }
}
