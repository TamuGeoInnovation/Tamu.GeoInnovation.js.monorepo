import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, reduce } from 'rxjs/operators';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { ClientMetadata } from '@tamu-gisc/oidc/provider-nest';

@Injectable({
  providedIn: 'root'
})
export class ClientMetadataService {
  public resource: string;

  constructor(private env: EnvironmentService, private http: HttpClient) {
    this.resource = this.env.value('api_url') + '/client-metadata';
  }

  public getClientMetadata(guid: string) {
    return this.http
      .get<Partial<ClientMetadata>>(`${this.resource}/${guid}`, {
        withCredentials: true
      })
      .pipe(
        map((clientResponse: ClientMetadata) => {
          const newClientResponse: IClientMetadataResponseArrayed = {
            guid: clientResponse.guid,
            clientName: clientResponse.clientName,
            clientSecret: clientResponse.clientSecret,
            // grantTypes: this.flattenArray(clientResponse.grantTypes, 'type'),
            grantTypes: clientResponse.grantTypes.map((grant) => grant.guid),
            redirectUris: this.flattenArray(clientResponse.redirectUris, 'url'),
            responseTypes: clientResponse.responseTypes.map((response) => response.guid),
            // responseTypes: this.flattenArray(clientResponse.responseTypes, 'type'),
            token_endpoint_auth_method: clientResponse.tokenEndpointAuthMethod.guid
          };
          return newClientResponse;
        })
      );
  }

  public getClientMetadatas() {
    return this.http
      .get<Array<Partial<ClientMetadata>>>(this.resource, {
        withCredentials: true
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
              token_endpoint_auth_method: client.tokenEndpointAuthMethod.type
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

  public updateClientMetadata(updatedClientMetadata: Partial<ClientMetadata>) {
    return this.http.patch<Partial<ClientMetadata>>(`${this.resource}/update`, updatedClientMetadata, {
      withCredentials: true
    });
  }

  public createClientMetadata(newClientMetadata: Partial<ClientMetadata>) {
    return this.http
      .post<Partial<ClientMetadata>>(this.resource, newClientMetadata, {
        withCredentials: true
      })
      .subscribe((newestClient) => {
        console.log('Added client', newestClient);
      });
  }

  public deleteClientMetadata(clientMetadata: ClientMetadata) {
    return this.http.delete<Partial<ClientMetadata>>(`${this.resource}/delete/${clientMetadata.guid}`, {
      withCredentials: true
    });
  }
}

export interface IClientMetadataResponse {
  guid: string;
  clientName: string;
  clientSecret: string;
  grantTypes: string;
  redirectUris: string;
  responseTypes: string;
  token_endpoint_auth_method: string;
}

export interface IClientMetadataResponseArrayed {
  guid: string;
  clientName: string;
  clientSecret: string;
  grantTypes: string[];
  redirectUris: string;
  responseTypes: string[];
  token_endpoint_auth_method: string;
}
