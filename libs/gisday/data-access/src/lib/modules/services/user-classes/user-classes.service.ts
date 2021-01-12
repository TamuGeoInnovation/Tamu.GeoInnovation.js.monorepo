import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { Class, UserClass } from '@tamu-gisc/gisday/data-api';

import { BaseService } from '../_base/base.service';

@Injectable({
  providedIn: 'root'
})
export class UserClassesService extends BaseService<UserClass> {
  public withCredentials = true;
  public resource: string;

  constructor(private env1: EnvironmentService, private http1: HttpClient) {
    super(env1, http1, 'user-class', true);
  }

  public deleteEntityWithClassGuid(classGuid: string) {
    return this.http1
      .request('DELETE', `${this.resource}`, {
        body: {
          classGuid: classGuid
        },
        withCredentials: this.withCredentials
      })
      .subscribe((result) => {
        console.log(result);
      });
  }

  public getClassesAndUserClasses() {
    return this.http1.get<Array<Partial<Class>>>(`${this.resource}`, {
      withCredentials: this.withCredentials
    });
  }
}
