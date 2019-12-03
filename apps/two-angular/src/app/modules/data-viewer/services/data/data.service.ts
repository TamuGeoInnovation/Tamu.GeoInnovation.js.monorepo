import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { WeatherFlux } from '@tamu-gisc/two/common';

import { BaseApiService } from '../base-api/base-api.service';

@Injectable({
  providedIn: 'root'
})
export class DataService extends BaseApiService<WeatherFlux> {
  constructor(private e: EnvironmentService, private h: HttpClient) {
    super(e, h);

    this.resource = 'data';
  }

  public getFieldData(options: { sites: string[]; fields: string[]; startDate: Date; endDate: Date }) {
    return this.h.get<Array<WeatherFlux>>(
      `${this.api_url}/${
        this.resource
      }/${options.sites.toString()}/${options.fields.toString()}/${options.startDate.toISOString()}/${options.endDate.toISOString()}`
    );
  }
}
