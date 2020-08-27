import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, reduce } from 'rxjs/operators';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import {
  ClientMetadata,
  GrantType,
  RedirectUri,
  TokenEndpointAuthMethod,
  ResponseType
} from '@tamu-gisc/oidc/provider-nest';

@Injectable({
  providedIn: 'root'
})
export class ClientMetadataService {
  public resource: string;

  constructor(private env: EnvironmentService, private http: HttpClient) {
    this.resource = this.env.value('api_url') + '/client-metadata';
  }

  public getClientMetadatas() {
    return this.http
      .get<Array<Partial<ClientMetadata>>>(this.resource, {
        withCredentials: false
      })
      .pipe(
        map<Partial<ClientMetadata[]>, IClientMetadataResponse[]>((clientResponse: ClientMetadata[], index: number) => {
          const clients: IClientMetadataResponse[] = [];
          clientResponse.forEach((client: ClientMetadata) => {
            const newClientResponse: IClientMetadataResponse = {
              guid: client.guid,
              clientName: client.clientName,
              clientSecret: client.clientSecret,
              grantTypes: this.flattenArray(client.grantTypes, 'type'),
              redirectUris: this.flattenArray(client.redirectUris, 'url'),
              responseTypes: this.flattenArray(client.responseTypes, 'type'),
              tokenEndpointAuthMethod: client.tokenEndpointAuthMethod.type
            };
            clients.push(newClientResponse);
          });
          return clients;
        })
      );
  }

  private flattenArray<K extends keyof T, T>(inputArray: T[], key: K): string {
    const vals: string[] = [];
    inputArray.forEach((value: T) => {
      const val = `${value[key]} `;
      vals.push(val);
    });
    const ret = ''.concat(...vals).trimEnd();
    return ret;
  }
}

export interface IClientMetadataResponse {
  guid: string;
  clientName: string;
  clientSecret: string;
  grantTypes: string;
  redirectUris: string;
  responseTypes: string;
  tokenEndpointAuthMethod: string;
}
