import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

@Injectable({
  providedIn: 'root'
})
export class AccountDetailsService {
  public resource: string;

  constructor(private env: EnvironmentService, private http: HttpClient) {
    this.resource = this.env.value('api_url') + 'userservices/getdetails';
  }

  public get details() {
    return this.http.get(this.resource);
  }

  public login(email?: string, password?: string) {
    return this.http.get(this.env.value('api_url') + 'login', {
      params: {
        email,
        password
      }
    });
  }
}
