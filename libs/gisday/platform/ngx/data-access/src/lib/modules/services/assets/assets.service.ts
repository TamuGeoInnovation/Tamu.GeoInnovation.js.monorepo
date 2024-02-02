import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, switchMap } from 'rxjs';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { Asset } from '@tamu-gisc/gisday/platform/data-api';

import { BaseService } from '../_base/base.service';

@Injectable({
  providedIn: 'root'
})
export class AssetsService extends BaseService<Asset> {
  public resource: string;

  constructor(private env1: EnvironmentService, private http1: HttpClient) {
    super(env1, http1, 'assets');
  }

  public getAsset(guid: string) {
    return this.getAssetUrl(guid).pipe(switchMap((url) => this.http1.get<string>(url)));
  }

  public getAssetUrl(guid: string) {
    return of(`${this.resource}/${guid}`);
  }
}
