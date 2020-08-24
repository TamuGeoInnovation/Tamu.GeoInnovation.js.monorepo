import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { Role } from '@tamu-gisc/oidc/provider-nest';

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  public resource: string;

  constructor(private env: EnvironmentService, private http: HttpClient) {
    this.resource = this.env.value('api_url') + '/role';
  }

  public updateDetails(updatedRole: Partial<Role>) {
    return this.http.post<Partial<Role>>(`${this.resource}/update`, updatedRole, {
      withCredentials: false
    });
  }

  public getRolesAll() {
    return this.http.get<Array<Partial<Role>>>(this.resource, {
      withCredentials: false
    });
  }

  public getRole(guid: string) {
    return this.http.get<Partial<Role>>(`${this.resource}/${guid}`, {
      withCredentials: false
    });
  }

  public addRolePost(newRole: Partial<Role>) {
    return this.http.post<Partial<Role>>(this.resource, newRole, {
      withCredentials: false
    });
  }
}
