import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { User } from '@tamu-gisc/covid/common/entities';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  public resource: string;

  constructor(private env: EnvironmentService, private http: HttpClient) {
    this.resource = this.env.value('covid_api_url') + 'users';
  }

  /**
   * Creates a user entry if one does not exist.
   */
  public registerEmail(userGuid: string) {
    return this.http.post<Partial<User>>(this.resource, { email: userGuid });
  }

  public verifyEmail(email: string) {
    return this.http.get<Partial<User>>(`${this.resource}/verify/${email}`);
  }
}
