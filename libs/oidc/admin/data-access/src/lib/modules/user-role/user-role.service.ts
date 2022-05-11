import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

@Injectable({
  providedIn: 'root'
})
export class UserRoleService {
  public resource: string;

  constructor(private env: EnvironmentService, private http: HttpClient) {
    this.resource = this.env.value('api_url') + '/user';
  }

  public insertUserRole(entity) {
    return this.http.post(`${this.resource}/role/api`, entity);
  }
}

