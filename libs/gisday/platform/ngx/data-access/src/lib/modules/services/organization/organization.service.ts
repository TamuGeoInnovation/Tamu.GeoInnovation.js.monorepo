import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { Organization } from '@tamu-gisc/gisday/platform/data-api';

import { BaseService } from '../_base/base.service';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService extends BaseService<Organization> {
  constructor(private env1: EnvironmentService, private http1: HttpClient) {
    super(env1, http1, 'organizations');
  }

  public updateEntityFormData(guid: string, data: FormData) {
    return this.http1.patch<Partial<Organization>>(`${this.resource}/${guid}`, data);
  }

  public createEntityFormData(data: FormData) {
    return this.http1.post<Partial<Organization>>(this.resource, data);
  }
}
