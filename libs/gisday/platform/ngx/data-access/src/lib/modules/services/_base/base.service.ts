import { HttpClient } from '@angular/common/http';

import { DeepPartial } from 'typeorm';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

export abstract class BaseService<T> {
  public resource: string;

  constructor(private environmentService: EnvironmentService, private httpClient: HttpClient, private route: string) {
    this.resource = this.environmentService.value('api_url') + `/${route}`;
  }

  public getEntities() {
    return this.httpClient.get<Array<Partial<T>>>(`${this.resource}/`);
  }

  public getEntity(guid: string) {
    return this.httpClient.get<Partial<T>>(`${this.resource}/${guid}`);
  }

  public getEntityWithRelations(guid: string) {
    return this.httpClient.get<DeepPartial<T>>(`${this.resource}/${guid}/deep`);
  }

  public updateEntity(guid: string, updatedEntity: Partial<T>) {
    return this.httpClient.patch<Partial<T>>(`${this.resource}/${guid}`, updatedEntity);
  }

  public createEntity(newEntity?: Partial<T>) {
    return this.httpClient.post<Partial<T>>(this.resource, newEntity);
  }

  public deleteEntity(entityGuid: string) {
    return this.httpClient.delete<Partial<T>>(`${this.resource}/${entityGuid}`);
  }
}
