import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {
  private readonly http = inject(HttpClient);
  private readonly env = inject(EnvironmentService);

  private _resource: string;

  constructor() {
    this._resource = `${this.env.value('api_url')}/authorization/permissions`;
  }

  public getRoles() {
    return this.http.get<Array<string>>(this._resource);
  }
}
