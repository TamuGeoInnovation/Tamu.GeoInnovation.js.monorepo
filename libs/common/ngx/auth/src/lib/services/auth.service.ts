import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { AuthOptions } from '@tamu-gisc/oidc/client';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public authOptions: AuthOptions;

  constructor(private http: HttpClient, private env: EnvironmentService) {
    if (this.env.value('auth_url', true)) {
      this.authOptions.url = this.env.value('auth_url', true);
    } else if (this.env.value('auth_options', true)) {
      this.authOptions = this.env.value('auth_options', true);
    } else {
      throw new Error('App authentication requires auth_url or auth_options.');
    }
  }

  public isAuthenticated() {
    return this.http.get(this.authOptions.url + '/oidc/userinfo', { withCredentials: true }).pipe(map((result) => true));
  }
}
