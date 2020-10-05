import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

export abstract class BaseService<T> {
  public withCredentials = false;
  public resource: string;

  constructor(private env: EnvironmentService, private http: HttpClient, private route: string, withCreds?: boolean) {
    this.resource = this.env.value('api_url') + `/${route}`;
    this.withCredentials = withCreds;
  }

  public getEntity(guid: string) {
    return this.http.get<Partial<T>>(`${this.resource}/${guid}`, {
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
    return this.http
      .post<Partial<T>>(this.resource, newEntity, {
        withCredentials: this.withCredentials
      })
      .subscribe((response) => {
        console.log('Added entity', response);
      });
  }

  public deleteEntity(entityGuid: string) {
    return this.http.delete<Partial<T>>(`${this.resource}/${entityGuid}`, {
      withCredentials: this.withCredentials
    });
  }
}
