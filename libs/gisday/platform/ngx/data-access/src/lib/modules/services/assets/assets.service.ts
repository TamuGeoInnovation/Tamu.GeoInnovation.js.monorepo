import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, switchMap } from 'rxjs';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { Asset } from '@tamu-gisc/gisday/platform/data-api';

import { BaseService } from '../_base/base.service';

@Injectable({
  providedIn: 'root'
})
export class AssetsService extends BaseService<Asset> {
  private env1: EnvironmentService;
  private http1: HttpClient;

  public resource: string;

  constructor() {
    const env1 = inject(EnvironmentService);
    const http1 = inject(HttpClient);

    super(env1, http1, 'assets');
  
    this.env1 = env1;
    this.http1 = http1;
  }

  public getAsset(guid: string) {
    return this.getAssetUrl(guid).pipe(switchMap((url) => this.http1.get<string>(url)));
  }

  public getAssetUrl(path: string) {
    return of(`assets/uploads/${path}`);
  }
}
