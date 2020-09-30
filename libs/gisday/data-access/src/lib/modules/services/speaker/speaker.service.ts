import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { Speaker } from '@tamu-gisc/gisday/data-api';

@Injectable({
  providedIn: 'root'
})
export class SpeakerService {
  public resource: string;

  constructor(private env: EnvironmentService, private http: HttpClient) {
    this.resource = this.env.value('api_url') + '/speaker';
  }

  public getEntity(guid: string) {
    return this.http.get<Partial<Speaker>>(`${this.resource}/${guid}`, {
      withCredentials: false
    });
  }

  public getEntities() {
    return this.http.get<Array<Partial<Speaker>>>(`${this.resource}/all`, {
      withCredentials: false
    });
  }

  public getPresenter(guid: string) {
    return this.http.get<Partial<Speaker>>(`${this.resource}/presenter/${guid}`, {
      withCredentials: false
    });
  }

  public getPresenters() {
    return this.http.get<Array<Partial<Speaker>>>(`${this.resource}/presenters`, {
      withCredentials: false
    });
  }

  public updateEntity(updatedEntity: Partial<Speaker>) {
    return this.http.patch<Partial<Speaker>>(`${this.resource}`, updatedEntity, {
      withCredentials: true
    });
  }

  public createEntity(newEntity: Partial<Speaker>) {
    return this.http
      .post<Partial<Speaker>>(this.resource, newEntity, {
        withCredentials: true
      })
      .subscribe((response) => {
        console.log('Added entity', response);
      });
  }

  public deleteEntity(entity: Speaker) {
    return this.http.delete<Partial<Speaker>>(`${this.resource}/${entity.guid}`, {
      withCredentials: true
    });
  }
}
