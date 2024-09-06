import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { IUser, Roles } from '@tamu-gisc/ues/common/nest';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { isAuthorized } from '../utils/utils';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  public user: ReplaySubject<IUser> = new ReplaySubject();
  public permissions = {
    isUser: this.isAuthorized(['USER']),
    isAdmin: this.isAuthorized(['ADMIN']),
    isPublisher: this.isAuthorized(['PUBLISHER'])
  };

  constructor(private http: HttpClient, private env: EnvironmentService) {
    this.http.get<IUser>(this.env.value('apiUrl') + '/oidc/userinfo', { withCredentials: true }).subscribe((user) => {
      this.user.next(user);
    });
  }

  public isAuthorized(authorizedRoles: Array<Roles>): Observable<boolean> {
    return this.user.pipe(
      take(1),
      map((user) => {
        return isAuthorized(user?.claims?.groups, authorizedRoles);
      })
    );
  }
}
