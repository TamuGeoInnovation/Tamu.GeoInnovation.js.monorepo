import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Sponsor } from '@tamu-gisc/gisday/platform/data-api';

import { BaseService } from '../_base/base.service';

@Injectable({
  providedIn: 'root'
})
export class SponsorService extends BaseService<Sponsor> {
  private http1 = inject(HttpClient);

  public resource: string;

  constructor() {
    super('sponsors');
  }

  public updateEntityFormData(guid: string, data: FormData) {
    return this.http1.patch<Partial<Sponsor>>(`${this.resource}/${guid}`, data);
  }

  public createEntityFormData(data: FormData) {
    return this.http1.post<Partial<Sponsor>>(this.resource, data);
  }
}
