import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { TierBenefit } from '@tamu-gisc/geoservices/data-api';

import { BaseService } from '../_base/base.service';

@Injectable({
  providedIn: 'root'
})
export class TierBenefitService extends BaseService<TierBenefit> {
  constructor(private readonly env: EnvironmentService, private http: HttpClient) {
    super(env, http, 'tier-benefit');
  }

  public getShowcase() {
    return this.httpClient.get<Array<TierBenefit>>(`${this.resource}/showcase`, {
      withCredentials: true
    });
  }

  public getByCategoryId(categoryId: number) {
    return this.httpClient.get<Array<TierBenefit>>(`${this.resource}/by-category/${categoryId}`, {
      withCredentials: true
    });
  }

  public getByTierId(tierId: number) {
    return this.httpClient.get<Array<TierBenefit>>(`${this.resource}/by-tier/${tierId}`, {
      withCredentials: true
    });
  }
}
