import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Place } from '@tamu-gisc/gisday/platform/data-api';

import { BaseService } from '../_base/base.service';

@Injectable({
  providedIn: 'root'
})
export class PlaceService extends BaseService<Place> {
  private http1 = inject(HttpClient);

  constructor() {
    super('places');
  }

  public updateEntityFormData(guid: string, data: FormData) {
    return this.http1.patch<Partial<Place>>(`${this.resource}/${guid}`, data);
  }

  public createEntityFormData(data: FormData) {
    return this.http1.post<Partial<Place>>(this.resource, data);
  }
}
