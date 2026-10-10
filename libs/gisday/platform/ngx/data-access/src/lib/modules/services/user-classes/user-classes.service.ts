import { Injectable } from '@angular/core';

import { UserClass } from '@tamu-gisc/gisday/platform/data-api';

import { BaseService } from '../_base/base.service';

@Injectable({
  providedIn: 'root'
})
export class UserClassesService extends BaseService<UserClass> {
  public resource: string;

  constructor() {
    super('user-classes');
  }
}
