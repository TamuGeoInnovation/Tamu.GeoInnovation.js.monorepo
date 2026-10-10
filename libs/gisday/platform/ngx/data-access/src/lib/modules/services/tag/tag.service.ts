import { Injectable } from '@angular/core';

import { Tag } from '@tamu-gisc/gisday/platform/data-api';

import { BaseService } from '../_base/base.service';

@Injectable({
  providedIn: 'root'
})
export class TagService extends BaseService<Tag> {
  public resource: string;

  constructor() {
    super('tags');
  }
}
