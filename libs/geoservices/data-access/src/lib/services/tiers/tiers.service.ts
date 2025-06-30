import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { Tier } from '@tamu-gisc/geoservices/data-api';

import { BaseService } from '../_base/base.service';

@Injectable({
  providedIn: 'root'
})
export class TiersService extends BaseService<Tier> {
  constructor(private readonly env: EnvironmentService, private http: HttpClient) {
    super(env, http, 'tier');
  }

  public getTiers() {
    return this.getAll();
  }

  public getTierByTierId(tierId: string) {
    return this.httpClient.get<Tier>(`${this.resource}/by-tier-id/${tierId}`, {
      withCredentials: true
    });
  }
}
