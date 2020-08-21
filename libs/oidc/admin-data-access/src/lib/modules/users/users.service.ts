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

  public getUsersAll() {
    return this.http.get<Array<Partial<User>>>(this.userResource + '/all', {
      withCredentials: false
    });
  }

  public getSecretQuestionsAll() {
    return this.http.get<Array<Partial<SecretQuestion>>>(this.questionResource, {
      withCredentials: false
    });
  }
}
