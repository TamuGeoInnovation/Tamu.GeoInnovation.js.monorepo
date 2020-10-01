import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { GrantType } from '@tamu-gisc/oidc/provider-nestjs';

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
      withCredentials: true
    });
  }

  public getGrantTypes() {
    return this.http.get<Array<Partial<GrantType>>>(this.resource, {
      withCredentials: true
    });
  }

  public updateGrantType(updatedGrantType: Partial<GrantType>) {
    return this.http.patch<Partial<GrantType>>(`${this.resource}/update`, updatedGrantType, {
      withCredentials: true
    });
  }

  public createGrantType(newGrantType: Partial<GrantType>) {
    return this.http
      .post<Partial<GrantType>>(this.resource, newGrantType, {
        withCredentials: true
      })
      .subscribe((newestRole) => {
        console.log('Added role', newestRole);
      });
  }

  public deleteGrantType(grantType: GrantType) {
    return this.http.delete<Partial<GrantType>>(`${this.resource}/delete/${grantType.guid}`, {
      withCredentials: true
    });
  }
}
