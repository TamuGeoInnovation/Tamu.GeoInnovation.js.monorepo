import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { Lockdown } from '@tamu-gisc/covid/common/entities';

@Injectable({
  providedIn: 'root'
})
export class LockdownsService {
  public resource: string;

  constructor(private env: EnvironmentService, private http: HttpClient) {
    this.resource = this.env.value('covid_api_url') + 'lockdowns';
  }

  public submitLockdown(payload) {
    return this.http.post<Partial<Lockdown>>(this.resource, payload);
  }

  public getActiveLockdownForEmail(email: string) {
    return this.http.get<Partial<Lockdown>>(`${this.resource}/active/email/${email}`);
  }
}
