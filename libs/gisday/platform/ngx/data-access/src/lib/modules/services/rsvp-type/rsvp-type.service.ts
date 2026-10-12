import { Injectable } from '@angular/core';

import { RsvpType } from '@tamu-gisc/gisday/platform/data-api';

import { BaseService } from '../_base/base.service';

@Injectable({
  providedIn: 'root'
})
export class RsvpTypeService extends BaseService<RsvpType> {
  public resource: string;

  constructor() {
    super('rsvp-types');
  }
}
