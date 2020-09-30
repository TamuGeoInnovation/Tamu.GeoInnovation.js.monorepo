import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { Tag } from '@tamu-gisc/gisday/data-api';

@Injectable({
  providedIn: 'root'
})
export class TagService {
  public withCredentials = false;
  public resource: string;

  constructor(private env: EnvironmentService, private http: HttpClient) {
    this.resource = this.env.value('api_url') + '/tag';
  }

  public getEntity(guid: string) {
    return this.http.get<Partial<Tag>>(`${this.resource}/${guid}`, {
      withCredentials: this.withCredentials
    });
  }

  public getEntities() {
    return this.http.get<Array<Partial<Tag>>>(`${this.resource}/all`, {
      withCredentials: this.withCredentials
    });
  }

  public updateEntity(updatedEntity: Partial<Tag>) {
    return this.http.patch<Partial<Tag>>(`${this.resource}/update`, updatedEntity, {
      withCredentials: this.withCredentials
    });
  }

  public createEntity(newEntity: Partial<Tag>) {
    return this.http
      .post<Partial<Tag>>(this.resource, newEntity, {
        withCredentials: this.withCredentials
      })
      .subscribe((response) => {
        console.log('Added entity', response);
      });
  }

  public deleteEntity(entity: Tag) {
    return this.http.delete<Partial<Tag>>(`${this.resource}/delete/${entity.guid}`, {
      withCredentials: this.withCredentials
    });
  }
}
