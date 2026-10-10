import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, switchMap } from 'rxjs';

import { Asset } from '@tamu-gisc/gisday/platform/data-api';

import { BaseService } from '../_base/base.service';

@Injectable({
  providedIn: 'root'
})
export class AssetsService extends BaseService<Asset> {
  private http1 = inject(HttpClient);

  public resource: string;

  constructor() {
    super('assets');
  }

  public getAsset(guid: string) {
    return this.getAssetUrl(guid).pipe(switchMap((url) => this.http1.get<string>(url)));
  }

  public getAssetUrl(path: string) {
    return of(`assets/uploads/${path}`);
  }
}
