import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { Organization } from '@tamu-gisc/gisday/platform/data-api';

import { BaseService } from '../_base/base.service';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService extends BaseService<Organization> {
  private env1: EnvironmentService;
  private http1: HttpClient;

  constructor() {
    const env1 = inject(EnvironmentService);
    const http1 = inject(HttpClient);

    super(env1, http1, 'organizations');
  
    this.env1 = env1;
    this.http1 = http1;
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
