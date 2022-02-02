import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { LayerSource } from '@tamu-gisc/common/types';

@Injectable({
  providedIn: 'root'
})
export class SecureLayers {
  private resource: string;

  constructor(private readonly env: EnvironmentService, private readonly http: HttpClient) {
    this.resource = this.env.value('apiUrl') + '/layers';
  }

  public getLayers() {
    return this.http.get<LayerSource>(this.resource);
  }
}
