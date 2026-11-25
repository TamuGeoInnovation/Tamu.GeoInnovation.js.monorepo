import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Event, Tag } from '@tamu-gisc/gisday/platform/data-api';

import { BaseService } from '../_base/base.service';

@Injectable({
  providedIn: 'root'
})
export class TagService extends BaseService<Tag> {
  private readonly http1 = inject(HttpClient);

  public resource: string;

  constructor() {
    super('tags');
  }

  /** The sessions that have the tag, hidden ones too, for its admin page (#3033). */
  public getSessions(guid: string) {
    return this.http1.get<Array<Partial<Event>>>(`${this.resource}/${guid}/sessions`);
  }
}
