import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { DataGroupFlds } from '@tamu-gisc/two/common';

import { BaseApiService } from '../base-api/base-api.service';

@Injectable({
  providedIn: 'root'
})
export class FieldsService extends BaseApiService<DataGroupFlds> {
  constructor(private e: EnvironmentService, private h: HttpClient) {
    super(e, h);

    this.resource = 'dgf';
  }
}
