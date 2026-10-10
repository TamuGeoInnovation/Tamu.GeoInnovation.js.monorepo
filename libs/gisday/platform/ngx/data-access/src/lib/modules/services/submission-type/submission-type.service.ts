import { Injectable } from '@angular/core';

import { SubmissionType } from '@tamu-gisc/gisday/platform/data-api';

import { BaseService } from '../_base/base.service';

@Injectable({
  providedIn: 'root'
})
export class SubmissionTypeService extends BaseService<SubmissionType> {
  public resource: string;

  constructor() {
    super('submission-types');
  }
}
