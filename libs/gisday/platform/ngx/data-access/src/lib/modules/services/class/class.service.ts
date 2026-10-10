import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Class, UserClass } from '@tamu-gisc/gisday/platform/data-api';

import { BaseService } from '../_base/base.service';

@Injectable({
  providedIn: 'root'
})
export class ClassService extends BaseService<Class> {
  private http1 = inject(HttpClient);

  public resource: string;

  constructor() {
    super('classes');
  }

  public getClassStudents(classGuid: string) {
    return this.http1.get<Array<Partial<UserClass>>>(`${this.resource}/${classGuid}/attendance`);
  }

  public getAttendanceCSV(classGuid: string) {
    return this.http1.get(`${this.resource}/${classGuid}/attendance/export`);
  }
}
