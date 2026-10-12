import { Injectable } from '@angular/core';

import { University } from '@tamu-gisc/gisday/platform/data-api';

import { BaseService } from '../_base/base.service';

@Injectable({
  providedIn: 'root'
})
export class UniversityService extends BaseService<University> {
  public resource: string;

  constructor() {
    super('universities');
  }
}
