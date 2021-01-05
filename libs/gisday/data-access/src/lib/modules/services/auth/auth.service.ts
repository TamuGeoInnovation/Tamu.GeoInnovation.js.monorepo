import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public resource: string;

  constructor(private env: EnvironmentService, private http: HttpClient) {
    // this.resource = this.env.value('api_url') + '/login';
  }

  /**
   * Returns logged in state
   */
  public state() {
    return this.http.get<boolean>(this.env.value('api_url') + '/user', {
      withCredentials: true
    });
  }

  public getHeaderState() {
    return this.http.get<boolean>(this.env.value('api_url') + '/user/header', {
      withCredentials: true
    });
  }

  public getUserRole() {
    return this.http.get<IUserInfoResponse>(this.env.value('api_url') + '/user/role', {
      withCredentials: true
    });
  }

  public userLogout() {
    return this.http.get<IUserInfoResponse>(this.env.value('api_url') + '/user/logout', {
      withCredentials: true
    });
  }
}

export interface ITokenIntrospectionResponse {
  active: boolean;
  client_id: string;
  exp: number;
  iat: number;
  iss: string;
  jti: string;
  scope: string;
  sub: string;
  token_type: string;
}

export interface IUserInfoResponse {
  sub: string;
  family_name: string;
  given_name: string;
  name: string;
  profile: string;
  role: {
    client_role: string;
    level_role: string;
    name_role: string;
  };
}
