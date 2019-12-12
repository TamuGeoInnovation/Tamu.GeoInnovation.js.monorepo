import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { WeatherfluxExpanded } from '@tamu-gisc/two/common';

import { BaseApiService } from '../base-api/base-api.service';

@Injectable({
  providedIn: 'root'
})
export class DataService extends BaseApiService<WeatherfluxExpanded> {
  constructor(private e: EnvironmentService, private h: HttpClient) {
    super(e, h);

    this.resource = 'data';
  }

  public getFieldData(options: { node: number; sites: string[]; fields: string[]; startDate: Date; endDate: Date }) {
    return this.h.get<Array<WeatherfluxExpanded>>(
      `${this.api_url}/${this.resource}/${
        options.node
      }/${options.sites.toString()}/${options.fields.toString()}/${options.startDate.toISOString()}/${options.endDate.toISOString()}`
    );
  }
}
