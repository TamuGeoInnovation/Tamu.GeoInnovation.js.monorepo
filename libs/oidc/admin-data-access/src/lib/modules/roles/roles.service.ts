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

  public updateRole(updatedRole: Partial<Role>) {
    return this.http.patch<Partial<Role>>(`${this.resource}/update`, updatedRole, {
      withCredentials: true
    });
  }

  public getRoles() {
    return this.http.get<Array<Partial<Role>>>(this.resource, {
      withCredentials: true
    });
  }

  public getRole(guid: string) {
    return this.http.get<Partial<Role>>(`${this.resource}/${guid}`, {
      withCredentials: true
    });
  }

  public createRole(newRole: Partial<Role>) {
    return this.http
      .post<Partial<Role>>(this.resource, newRole, {
        withCredentials: true
      })
      .subscribe((newestRole) => {
        console.log('Added role', newestRole);
      });
  }

  public deleteRole(role: Role) {
    return this.http.delete<Partial<Role>>(`${this.resource}/delete/${role.guid}`, {
      withCredentials: true
    });
  }
}
