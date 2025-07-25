import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

export abstract class BaseService<T> {
  public resource: string;

  constructor(private environmentService: EnvironmentService, protected httpClient: HttpClient, private route: string) {
    this.resource = this.environmentService.value('api_url') + `/${route}`;
  }

  public getAll() {
    return this.httpClient.get<Array<T>>(`${this.resource}`, {
      withCredentials: true
    });
  }

  public getActive() {
    return this.httpClient.get<Array<T>>(`${this.resource}/active`, {
      withCredentials: true
    });
  }

  public getById(id: number) {
    return this.httpClient.get<T>(`${this.resource}/${id}`, {
      withCredentials: true
    });
  }

  public create(newEntity: Partial<T>) {
    return this.httpClient.post<T>(this.resource, newEntity, {
      withCredentials: true
    });
  }

  public clone(tierIds: Array<string | number>) {
    return this.httpClient.post<T>(
      `${this.resource}/clone`,
      { tierIds },
      {
        withCredentials: true
      }
    );
  }

  public update(id: number, updatedEntity: Partial<T>) {
    return this.httpClient.put<T>(`${this.resource}/${id}`, updatedEntity, {
      withCredentials: true
    });
  }

  public delete(id: number) {
    return this.httpClient.delete<void>(`${this.resource}/${id}`, {
      withCredentials: true
    });
  }

  public activate(id: number) {
    return this.httpClient.post<T>(`${this.resource}/${id}/activate`, null, {
      withCredentials: true
    });
  }

  public deactivate(id: number) {
    return this.httpClient.post<T>(`${this.resource}/${id}/deactivate`, null, {
      withCredentials: true
    });
  }
}
