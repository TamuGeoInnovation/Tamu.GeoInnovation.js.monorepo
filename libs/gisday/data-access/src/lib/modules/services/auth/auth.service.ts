import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public resource: string;

  constructor(private env: EnvironmentService, private http: HttpClient) {
    this.resource = this.env.value('api_url') + 'login';
  }

  /**
   * Returns logged in state
   */
  public state() {
    return this.http.get<ITokenIntrospectionResponse>(this.env.value('api_url') + '/user', {
      withCredentials: true
    });
    // .pipe(
    //   switchMap((res) => {
    //     return of(res);
    //   })
    // );
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
