import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { Class, UserClass } from '@tamu-gisc/gisday/platform/data-api';

import { BaseService } from '../_base/base.service';

@Injectable({
  providedIn: 'root'
})
export class ClassService extends BaseService<Class> {
  public resource: string;

  constructor(private env1: EnvironmentService, private http1: HttpClient) {
    super(env1, http1, 'classes');
  }

  public getClassStudents(classGuid: string) {
    return this.http1.get<Array<Partial<UserClass>>>(`${this.resource}/${classGuid}/attendance`);
  }

  public getAttendanceCSV(classGuid: string) {
    return this.http1.get(`${this.resource}/${classGuid}/attendance/export`);
  }
}
