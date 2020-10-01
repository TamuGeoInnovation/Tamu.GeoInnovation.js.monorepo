import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  public resource: string;

  constructor(private env: EnvironmentService, private http: HttpClient) {
    this.resource = this.env.value('api_url') + 'userServices/getDetails';
  }

  public getCountOfLoggedInUsers() {
    return this.http.get(this.resource, {
      withCredentials: true
    });
  }

  public getClientsByCountOfUsers() {}

  public getLoginsPastMonth() {}

  public getRegistrationsPastMonth() {}

  public getServerErrorCount() {}
}
