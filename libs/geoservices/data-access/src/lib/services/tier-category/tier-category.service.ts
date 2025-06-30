import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { TierCategory } from '@tamu-gisc/geoservices/data-api';

import { BaseService } from '../_base/base.service';

@Injectable({
  providedIn: 'root'
})
export class TierCategoryService extends BaseService<TierCategory> {
  constructor(private readonly env: EnvironmentService, private http: HttpClient) {
    super(env, http, 'tier-category');
  }

  public getByTierId(tierId: number) {
    return this.httpClient.get<Array<TierCategory>>(`${this.resource}/by-tier/${tierId}`, {
      withCredentials: true
    });
  }
}
