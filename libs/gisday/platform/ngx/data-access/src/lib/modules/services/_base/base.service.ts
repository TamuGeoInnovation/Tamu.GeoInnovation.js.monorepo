import { HttpClient } from '@angular/common/http';

import { DeepPartial } from 'typeorm';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

export abstract class BaseService<T> {
  public resource: string;

  constructor(private env: EnvironmentService, private http: HttpClient, private route: string) {
    this.resource = this.env.value('api_url') + `/${route}`;
  }

  public getEntities() {
    return this.http.get<Array<Partial<T>>>(`${this.resource}/`);
  }

  public getEntity(guid: string) {
    return this.http.get<Partial<T>>(`${this.resource}/${guid}`);
  }

  public getEntityWithRelations(guid: string) {
    return this.http.get<DeepPartial<T>>(`${this.resource}/${guid}/deep`);
  }

  public updateEntity(updatedEntity: Partial<T>) {
    return this.http.patch<Partial<T>>(`${this.resource}`, updatedEntity);
  }

  public createEntity(newEntity: Partial<T>) {
    return this.http.post<Partial<T>>(this.resource, newEntity);
  }

  public deleteEntity(entityGuid: string) {
    return this.http.delete<Partial<T>>(`${this.resource}`, {
      body: {
        guid: entityGuid
      }
    });
  }
}
