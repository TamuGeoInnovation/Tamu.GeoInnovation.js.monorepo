import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { User } from '@tamu-gisc/oidc/provider-nest';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  public resource: string;

  constructor(private env: EnvironmentService, private http: HttpClient) {
    this.resource = this.env.value('api_url') + '/user/all';
  }

  public getUsersAll() {
    return this.http.get<Array<Partial<User>>>(this.resource, {
      withCredentials: false
    });
  }
}
