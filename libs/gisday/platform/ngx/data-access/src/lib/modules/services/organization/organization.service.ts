import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Organization } from '@tamu-gisc/gisday/platform/data-api';

import { BaseService } from '../_base/base.service';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService extends BaseService<Organization> {
  private http1 = inject(HttpClient);

  constructor() {
    super('organizations');
  }

  public getOrgsWithEvents() {
    return this.http1.get<Organization[]>(`${this.resource}/active-events`);
  }

  public updateEntityFormData(guid: string, data: FormData) {
    return this.http1.patch<Partial<Organization>>(`${this.resource}/${guid}`, data);
  }

  public createEntityFormData(data: FormData) {
    return this.http1.post<Partial<Organization>>(this.resource, data);
  }
}
