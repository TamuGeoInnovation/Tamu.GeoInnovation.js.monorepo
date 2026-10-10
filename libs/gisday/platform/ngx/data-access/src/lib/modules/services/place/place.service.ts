import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { Place } from '@tamu-gisc/gisday/platform/data-api';

import { BaseService } from '../_base/base.service';

@Injectable({
  providedIn: 'root'
})
export class PlaceService extends BaseService<Place> {
  private env1: EnvironmentService;
  private http1: HttpClient;

  constructor() {
    const env1 = inject(EnvironmentService);
    const http1 = inject(HttpClient);

    super(env1, http1, 'places');
  
    this.env1 = env1;
    this.http1 = http1;
  }

  public updateEntityFormData(guid: string, data: FormData) {
    return this.http1.patch<Partial<Place>>(`${this.resource}/${guid}`, data);
  }

  public createEntityFormData(data: FormData) {
    return this.http1.post<Partial<Place>>(this.resource, data);
  }
}
