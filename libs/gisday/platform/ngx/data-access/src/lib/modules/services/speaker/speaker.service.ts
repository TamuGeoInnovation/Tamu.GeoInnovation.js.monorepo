import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { OidcSecurityService } from 'angular-auth-oidc-client';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { Speaker } from '@tamu-gisc/gisday/platform/data-api';

import { BaseService } from '../_base/base.service';

@Injectable({
  providedIn: 'root'
})
export class SpeakerService extends BaseService<Speaker> {
  public withCredentials = false;
  public resource: string;
  private accessToken;
  private headers: HttpHeaders;

  constructor(private env1: EnvironmentService, private http1: HttpClient, public oidcSecurityService: OidcSecurityService) {
    super(env1, http1, oidcSecurityService, 'speaker');

    this.accessToken = this.oidcSecurityService.getAccessToken();
    this.headers = new HttpHeaders({
      Authorization: 'Bearer ' + this.accessToken
    });
  }

  public getPresenter(guid: string) {
    return this.http1.get<Partial<Speaker>>(`${this.resource}/presenter/${guid}`, {
      withCredentials: this.withCredentials,
      headers: this.headers
    });
  }

  public getPresenters() {
    return this.http1.get<Array<Partial<Speaker>>>(`${this.resource}/presenters`, {
      withCredentials: false,
      headers: this.headers
    });
  }

  public getPhoto(guid: string) {
    return this.http1.get<string>(`${this.resource}/photo/${guid}`, {
      withCredentials: false
    });
  }

  public insertSpeakerInfo(data: FormData) {
    return this.http1
      .post(`${this.resource}`, data, {
        withCredentials: true
      })
      .subscribe((result) => {
        console.log(result);
      });
  }
}

export interface IPhotoReponse {
  base64: string;
}
