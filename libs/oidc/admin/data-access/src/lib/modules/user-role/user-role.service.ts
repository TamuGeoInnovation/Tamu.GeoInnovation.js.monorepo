import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { ISimplifiedUserRoleResponse, NewUserRole } from '@tamu-gisc/oidc/common';

@Injectable({
  providedIn: 'root'
})
export class UserRoleService {
  private resource: string;

  constructor(private env: EnvironmentService, private http: HttpClient) {
    this.resource = this.env.value('api_url') + '/user-role';
  }

  public getAll() {
    return this.http.get<Array<Partial<ISimplifiedUserRoleResponse>>>(`${this.resource}`);
  }

  public get(guid) {
    return this.http.get<Partial<NewUserRole>>(`${this.resource}/${guid}`);
  }

  public insert(entity) {
    return this.http.post(`${this.resource}`, entity);
  }

  public delete(guid) {
    return this.http.delete(`${this.resource}/${guid}`);
  }
}
