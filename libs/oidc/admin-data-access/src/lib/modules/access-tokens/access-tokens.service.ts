import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { AccessToken } from '@tamu-gisc/oidc/provider-nest';
import { access } from 'fs';

@Injectable({
  providedIn: 'root'
})
export class AccessTokenService {
  public resource: string;

  constructor(private env: EnvironmentService, private http: HttpClient) {
    this.resource = this.env.value('api_url') + '/access-token';
  }

  // public updateRole(updatedRole: Partial<Role>) {
  //   return this.http.patch<Partial<Role>>(`${this.resource}/update`, updatedRole, {
  //     withCredentials: true
  //   });
  // }

  public getAccessTokens() {
    return this.http.get<Array<Partial<AccessToken>>>(this.resource, {
      withCredentials: true
    });
  }

  // public getRole(guid: string) {
  //   return this.http.get<Partial<Role>>(`${this.resource}/${guid}`, {
  //     withCredentials: true
  //   });
  // }

  // public createRole(newRole: Partial<Role>) {
  //   return this.http
  //     .post<Partial<Role>>(this.resource, newRole, {
  //       withCredentials: true
  //     })
  //     .subscribe((newestRole) => {
  //       console.log('Added role', newestRole);
  //     });
  // }

  public revokeAccessToken(accessToken: AccessToken) {
    return this.http.delete<Partial<AccessToken>>(`${this.resource}/delete/${accessToken.grantId}`, {
      withCredentials: true
    });
  }
}
