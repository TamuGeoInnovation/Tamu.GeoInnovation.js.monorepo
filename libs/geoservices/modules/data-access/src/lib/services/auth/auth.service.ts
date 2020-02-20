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
    return this.http
      .get<ILoggedInResponse>(this.env.value('api_url') + 'userservices/getdetails', {
        withCredentials: true
      })
      .pipe(
        switchMap((res) => {
          return of(res.Status === undefined);
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
  Status: string;
}
