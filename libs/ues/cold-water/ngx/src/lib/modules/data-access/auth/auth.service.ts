import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl: string;

  constructor(private env: EnvironmentService, private http: HttpClient) {
    this.apiUrl = this.env.value('apiUrl') + 'auth';
  }

  public getStatus() {
    return this.http.get(this.apiUrl, { withCredentials: true });
  }
}
