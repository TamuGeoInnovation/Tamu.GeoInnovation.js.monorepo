import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  public resource: string;

  constructor(private env: EnvironmentService, private http: HttpClient) {
    this.resource = this.env.value('api_url') + 'role';
  }

  public getRolesAll() {
    return this.http
      .get(this.resource, {
        withCredentials: true
      })
      .subscribe((ret) => {
        debugger;
        console.log(ret);
      });
  }
}
