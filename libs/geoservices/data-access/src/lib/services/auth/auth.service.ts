import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public resource: string;

  constructor(private env: EnvironmentService, private http: HttpClient) {
    this.resource = this.env.value('legacy_api_url') + 'login';
  }

  /**
   * Returns logged in state
   */
  public state(): Observable<LoggedInState> {
    return this.http
      .get<ILoggedInResponse>(this.env.value('legacy_api_url') + 'userServices/getDetails', {
        withCredentials: true
      })
      .pipe(
        map((res) => {
          let loggedIn = true;

          if (res.Status) {
            loggedIn = false;
          }

          if (res.result) {
            loggedIn = false;
          }

          return {
            loggedIn
          };
        })
      );
  }

  /**
   * Performs login
   */
  public login(email?: string, password?: string) {
    return this.http.get(this.resource, {
      params: {
        email,
        password
      },
      withCredentials: true
    });
  }
}

interface ILoggedInResponse {
  Status?: string;
  result?: string;
}

export interface LoggedInState {
  loggedIn: boolean;
}
