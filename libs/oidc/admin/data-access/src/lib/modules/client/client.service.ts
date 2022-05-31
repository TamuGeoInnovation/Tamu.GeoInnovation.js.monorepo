import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { Client } from '@tamu-gisc/oidc/common';

import { BaseService } from '../_base/base.service';

@Injectable({
  providedIn: 'root'
})
export class ClientService extends BaseService<Client> {
  constructor(private env1: EnvironmentService, private http1: HttpClient) {
    super(env1, http1, 'clients');
  }
}
