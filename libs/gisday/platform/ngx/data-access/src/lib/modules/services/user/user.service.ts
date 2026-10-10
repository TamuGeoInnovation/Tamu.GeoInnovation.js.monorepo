import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { User } from '@auth0/auth0-angular';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { GisDayAppMetadata } from '@tamu-gisc/gisday/platform/data-api';
import { Auth0UserProfile } from '@tamu-gisc/common/nest/auth';

import { BaseService } from '../_base/base.service';

@Injectable({
  providedIn: 'root'
})
export class UserService extends BaseService<User> {
  private env1: EnvironmentService;
  private http1: HttpClient;

  public resource: string;

  constructor() {
    const env1 = inject(EnvironmentService);
    const http1 = inject(HttpClient);

    super(env1, http1, 'users');
  
    this.env1 = env1;
    this.http1 = http1;
  }

  public getUsers() {
    return this.http1.get<Array<Auth0UserProfile>>(`${this.resource}`);
  }

  public getUser(userId: string) {
    return this.http1.get<Array<Auth0UserProfile>>(`${this.resource}/${userId}`);
  }

  public getUserMetadata(userId: string) {
    return this.http1.get<GisDayAppMetadata>(`${this.resource}/${userId}/metadata`);
  }

  public updateUserMetadata(userId: string, metadata: Partial<GisDayAppMetadata>) {
    return this.http1.patch<Partial<GisDayAppMetadata>>(`${this.resource}/${userId}/metadata`, metadata);
  }
}
