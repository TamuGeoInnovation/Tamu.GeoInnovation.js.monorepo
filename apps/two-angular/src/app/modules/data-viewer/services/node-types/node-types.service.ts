import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { NodeGroups } from '@tamu-gisc/two/common';

import { BaseApiService } from '../base-api/base-api.service';

@Injectable({
  providedIn: 'root'
})
export class NodeTypesService extends BaseApiService<NodeGroups> {
  constructor(private e: EnvironmentService, private h: HttpClient) {
    super(e, h);

    this.resource = 'node-groups';
  }
}
