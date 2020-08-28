import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { ResponseType } from '@tamu-gisc/oidc/provider-nest';

@Injectable({
  providedIn: 'root'
})
export class ResponseTypesService {
  public resource: string;

  constructor(private env: EnvironmentService, private http: HttpClient) {
    this.resource = this.env.value('api_url') + '/client-metadata/response-type';
  }

  public getResponseType(guid: string) {
    return this.http.get<Partial<ResponseType>>(`${this.resource}/${guid}`, {
      withCredentials: false
    });
  }

  public getResponseTypes() {
    return this.http.get<Array<Partial<ResponseType>>>(this.resource, {
      withCredentials: false
    });
  }
}
