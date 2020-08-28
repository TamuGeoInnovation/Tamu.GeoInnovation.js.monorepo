import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { GrantType } from '@tamu-gisc/oidc/provider-nest';

@Injectable({
  providedIn: 'root'
})
export class GrantTypesService {
  public resource: string;

  constructor(private env: EnvironmentService, private http: HttpClient) {
    this.resource = this.env.value('api_url') + '/client-metadata/grant';
  }

  public getGrantType(guid: string) {
    return this.http.get<Partial<GrantType>>(`${this.resource}/${guid}`, {
      withCredentials: false
    });
  }

  public getGrantTypes() {
    return this.http.get<Array<Partial<GrantType>>>(this.resource, {
      withCredentials: false
    });
  }
}
