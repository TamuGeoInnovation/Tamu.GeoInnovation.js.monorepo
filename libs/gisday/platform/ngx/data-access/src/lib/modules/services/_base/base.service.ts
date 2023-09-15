import { HttpClient, HttpHeaders } from '@angular/common/http';

import { DeepPartial } from 'typeorm';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

export abstract class BaseService<T> {
  public resource: string;
  public headers: HttpHeaders;

  constructor(private env: EnvironmentService, private http: HttpClient, private route: string) {
    this.resource = this.env.value('api_url') + `/${route}`;
  }

  public getEntity(guid: string, headers?: HttpHeaders) {
    if (headers) {
      return this.http.get<Partial<T>>(`${this.resource}/${guid}`, {
        headers: headers
      });
    } else {
      return this.http.get<Partial<T>>(`${this.resource}/${guid}`);
    }
  }

  public getEntityWithRelations(guid: string, headers?: HttpHeaders) {
    if (headers) {
      return this.http.get<DeepPartial<T>>(`${this.resource}/${guid}/deep`, {
        headers: headers
      });
    } else {
      return this.http.get<DeepPartial<T>>(`${this.resource}/${guid}/deep`);
    }
  }

  public getEntities(headers?: HttpHeaders) {
    if (headers) {
      return this.http.get<Array<Partial<T>>>(`${this.resource}/all`, {
        headers: headers
      });
    } else {
      return this.http.get<Array<Partial<T>>>(`${this.resource}/all`);
    }
  }

  public updateEntity(updatedEntity: Partial<T>, headers?: HttpHeaders) {
    if (headers) {
      return this.http.patch<Partial<T>>(`${this.resource}`, updatedEntity, {
        headers: headers
      });
    } else {
      return this.http.patch<Partial<T>>(`${this.resource}`, updatedEntity);
    }
  }

  public createEntity(newEntity: Partial<T>, headers?: HttpHeaders) {
    if (headers) {
      return this.http.post<Partial<T>>(this.resource, newEntity, {
        headers: headers
      });
    } else {
      return this.http.post<Partial<T>>(this.resource, newEntity);
    }
  }

  public deleteEntity(entityGuid: string, headers?: HttpHeaders) {
    if (headers) {
      return this.http.delete<Partial<T>>(`${this.resource}/${entityGuid}`, {
        headers: headers
      });
    } else {
      return this.http.delete<Partial<T>>(`${this.resource}/${entityGuid}`);
    }
  }
}
