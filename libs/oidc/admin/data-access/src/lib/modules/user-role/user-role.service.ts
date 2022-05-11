import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { ISimplifiedUserRoleResponse } from '@tamu-gisc/oidc/common';

@Injectable({
  providedIn: 'root'
})
export class UserRoleService {
  private resource: string;

  constructor(private env: EnvironmentService, private http: HttpClient) {
    this.resource = this.env.value('api_url') + '/user-role';
  }

  public getAllUserRoles() {
    return this.http.get<Array<Partial<ISimplifiedUserRoleResponse>>>(`${this.resource}`);
  }

  // TODO: Move this function on the backend from user/role/api to POST user-role
  public insertUserRole(entity) {
    return this.http.post(`${this.resource}/role/api`, entity);
  }
}

