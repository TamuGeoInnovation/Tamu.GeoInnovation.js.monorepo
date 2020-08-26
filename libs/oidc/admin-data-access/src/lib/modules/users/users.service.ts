import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { User, SecretQuestion } from '@tamu-gisc/oidc/provider-nest';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  public userResource: string;
  public questionResource: string;

  constructor(private env: EnvironmentService, private http: HttpClient) {
    this.userResource = this.env.value('api_url') + '/user';
    this.questionResource = this.env.value('api_url') + '/secret-question';
  }

  public getUser(guid: string) {
    return this.http.get<Partial<User>>(`${this.userResource}/${guid}`, {
      withCredentials: false
    });
  }

  public getUsers() {
    return this.http.get<Array<Partial<User>>>(`${this.userResource}/all`, {
      withCredentials: false
    });
  }

  public deleteUser(user: User) {
    return this.http.delete<Partial<User>>(`${this.userResource}/delete/${user.guid}`);
  }

  public updateUser(updatedUser: Partial<User>) {
    return this.http.patch<Partial<User>>(`${this.userResource}/update`, updatedUser, {
      withCredentials: false
    });
  }

  public getSecretQuestions() {
    return this.http.get<Array<Partial<SecretQuestion>>>(this.questionResource, {
      withCredentials: false
    });
  }
}
