import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, map, shareReplay } from 'rxjs';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public resource: string;

  /**
   * Returns logged in state
   */
  public state: Observable<LoggedInState>;
  public apiKey: Observable<string>;

  constructor(private env: EnvironmentService, private http: HttpClient) {
    this.resource = this.env.value('legacy_api_url') + 'login';

    this.state = this.http
      .get<INotLoggedInResponse | ILoggedInResponse>(this.env.value('legacy_api_url') + 'userServices/getDetails/', {
        withCredentials: true
      })
      .pipe(
        map((res) => {
          let loggedIn = true;

          // The logged in object is not standard and will only return `Status` or `result` if the user is not logged in.
          if ((res as INotLoggedInResponse)?.Status) {
            loggedIn = false;
          }

          if ((res as INotLoggedInResponse)?.result) {
            loggedIn = false;
          }

          return {
            loggedIn,
            data: res,
            isManager: res?.isManager === 'true'
          };
        }),
        catchError(() => {
          return of({
            loggedIn: false,
            data: null,
            isManager: false
          });
        }),
        shareReplay()
      );

    this.apiKey = this.state.pipe(
      map((state) => {
        if (state.loggedIn) {
          return (state.data as ILoggedInResponse).APIKey;
        } else {
          return 'demo';
        }
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

interface INotLoggedInResponse {
  Status?: string;
  result?: string;
  isManager?: string;
}

interface ILoggedInResponse {
  APIKey: string;
  Guid: string;
  isManager: string;
}

export interface LoggedInState {
  loggedIn: boolean;
  isManager: boolean;
  data: null | ILoggedInResponse;
}
