import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { OidcSecurityService } from 'angular-auth-oidc-client';

@Injectable({
  providedIn: 'root'
})
export class SignageService {
  private accessToken;
  private headers: HttpHeaders;

  constructor(private http: HttpClient, public oidcSecurityService: OidcSecurityService) {
    this.accessToken = this.oidcSecurityService.getAccessToken();
    this.headers = new HttpHeaders({
      Authorization: 'Bearer ' + this.accessToken
    });
  }

  public getUrl(competition: string) {
    // TODO: Update to a local url if possible; since this is an old competition maybe not
    return `https://gisday.tamu.edu/rest/${competition}/Get/Submissions/?geoJSON=true`;
  }

  public getSignage() {
    return this.http.get(this.getUrl('Signage'), {
      headers: this.headers
    });
  }
}
