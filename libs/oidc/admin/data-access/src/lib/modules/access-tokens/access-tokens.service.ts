import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map } from 'rxjs/operators';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { AccessToken } from '@tamu-gisc/oidc/common';

@Injectable({
  providedIn: 'root'
})
export class AccessTokenService {
  public resource: string;

  constructor(private env: EnvironmentService, private http: HttpClient) {
    this.resource = this.env.value('api_url') + '/access-token';
  }

  public getAccessTokens() {
    return this.http
      .get<Array<Partial<AccessToken>>>(this.resource, {
        withCredentials: true
      })
      .pipe(
        map((accessTokens) => {
          const goodTokens = accessTokens.filter((val: Partial<AccessToken>) => {
            if (val.clientId != null) {
              return val;
            }
          });
          return goodTokens;
        })
      );
  }

  public revokeAccessToken(accessToken: AccessToken) {
    return this.http.delete<Partial<AccessToken>>(`${this.resource}/delete/${accessToken.grantId}`, {
      withCredentials: true
    });
  }
}
