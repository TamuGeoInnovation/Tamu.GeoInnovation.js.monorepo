import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { DataGroups } from '@tamu-gisc/two/common';

import { BaseApiService } from '../base-api/base-api.service';

@Injectable({
  providedIn: 'root'
})
export class DataGroupsService extends BaseApiService<DataGroups> {
  constructor(private e: EnvironmentService, private h: HttpClient) {
    super(e, h);

    this.resource = 'data-groups';
  }
}
