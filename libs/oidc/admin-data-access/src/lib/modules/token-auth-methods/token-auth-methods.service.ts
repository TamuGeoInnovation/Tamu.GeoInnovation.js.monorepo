import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { TokenEndpointAuthMethod } from '@tamu-gisc/oidc/provider-nestjs';

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
      withCredentials: true
    });
  }

  public getTokenAuthMethods() {
    return this.http.get<Array<Partial<TokenEndpointAuthMethod>>>(this.resource, {
      withCredentials: true
    });
  }

  public updateTokenEndpointAuthMethod(updatedTokenEndpointAuthMethod: Partial<TokenEndpointAuthMethod>) {
    return this.http.patch<Partial<TokenEndpointAuthMethod>>(`${this.resource}/update`, updatedTokenEndpointAuthMethod, {
      withCredentials: true
    });
  }

  public createTokenEndpointAuthMethod(newTokenEndpointAuthMethod: Partial<TokenEndpointAuthMethod>) {
    return this.http
      .post<Partial<TokenEndpointAuthMethod>>(this.resource, newTokenEndpointAuthMethod, {
        withCredentials: true
      })
      .subscribe((newTokenEndpointAuthMethod) => {
        console.log('Added newTokenEndpointAuthMethod', newTokenEndpointAuthMethod);
      });
  }

  public deleteTokenEndpointAuthMethod(newTokenEndpointAuthMethod: TokenEndpointAuthMethod) {
    return this.http.delete<Partial<TokenEndpointAuthMethod>>(`${this.resource}/delete/${newTokenEndpointAuthMethod.guid}`, {
      withCredentials: true
    });
  }
}
