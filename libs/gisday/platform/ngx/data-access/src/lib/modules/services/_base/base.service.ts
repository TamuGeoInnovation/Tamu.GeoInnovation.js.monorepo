import { HttpClient, HttpHeaders } from '@angular/common/http';

import { OidcSecurityService } from 'angular-auth-oidc-client';
import { DeepPartial } from 'typeorm';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

export abstract class BaseService<T> {
  public withCredentials = false;
  public resource: string;

  constructor(
    private env: EnvironmentService,
    private http: HttpClient,
    public oidcSecurityService: OidcSecurityService,
    private route: string
  ) {
    this.resource = this.env.value('api_url') + `/${route}`;
  }

  public getEntity(guid: string) {
    return this.http.get<Partial<T>>(`${this.resource}/${guid}`, {
      withCredentials: this.withCredentials
    });
  }

  public getEntityWithRelations(guid: string) {
    return this.http.get<DeepPartial<T>>(`${this.resource}/${guid}/deep`, {
      withCredentials: this.withCredentials
    });
  }

  public getEntities() {
    return this.http.get<Array<Partial<T>>>(`${this.resource}/all`, {
      withCredentials: this.withCredentials
    });
  }

  public updateEntity(updatedEntity: Partial<T>) {
    return this.http.patch<Partial<T>>(`${this.resource}`, updatedEntity, {
      withCredentials: this.withCredentials
    });
  }

  public createEntity(newEntity: Partial<T>) {
    return this.http.post<Partial<T>>(this.resource, newEntity, {
      withCredentials: this.withCredentials
    });
  }

  public deleteEntity(entityGuid: string) {
    return this.http.delete<Partial<T>>(`${this.resource}/${entityGuid}`, {
      withCredentials: this.withCredentials
    });
  }
}
