import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { Place } from '@tamu-gisc/gisday/platform/data-api';

import { BaseService } from '../_base/base.service';

@Injectable({
  providedIn: 'root'
})
export class PlaceService extends BaseService<Place> {
  constructor(private env1: EnvironmentService, private http1: HttpClient) {
    super(env1, http1, 'places');
  }

  public updateEntityFormData(guid: string, data: FormData) {
    return this.http1.patch<Partial<Place>>(`${this.resource}/${guid}`, data);
  }

  public createEntityFormData(data: FormData) {
    return this.http1.post<Partial<Place>>(this.resource, data);
  }
}
