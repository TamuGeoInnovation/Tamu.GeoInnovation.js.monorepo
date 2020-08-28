import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { TokenEndpointAuthMethod } from '@tamu-gisc/oidc/provider-nest';

@Injectable({
  providedIn: 'root'
})
export class TokenAuthMethodsService {
  public resource: string;

  constructor(private env: EnvironmentService, private http: HttpClient) {
    this.resource = this.env.value('api_url') + '/client-metadata/token-endpoint';
  }

  public getTokenAuthMethod(guid: string) {
    return this.http.get<Partial<TokenEndpointAuthMethod>>(`${this.resource}/${guid}`, {
      withCredentials: false
    });
  }

  public getTokenAuthMethods() {
    return this.http.get<Array<Partial<TokenEndpointAuthMethod>>>(this.resource, {
      withCredentials: false
    });
  }
}
