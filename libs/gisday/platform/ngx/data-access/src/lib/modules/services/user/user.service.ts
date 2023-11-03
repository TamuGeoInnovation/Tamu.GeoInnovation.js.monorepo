import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { GisDayAppMetadata, UserInfo } from '@tamu-gisc/gisday/platform/data-api';

import { BaseService } from '../_base/base.service';

@Injectable({
  providedIn: 'root'
})
export class UserService extends BaseService<UserInfo> {
  public resource: string;

  constructor(private env1: EnvironmentService, private http1: HttpClient) {
    super(env1, http1, 'users');
  }

  public getSignedOnEntity() {
    return this.http1.get<GisDayAppMetadata>(`${this.resource}`);
  }

  public updateSignedOnEntity(metadata: Partial<GisDayAppMetadata>) {
    return this.http1.patch<Partial<GisDayAppMetadata>>(`${this.resource}`, metadata);
  }
}
