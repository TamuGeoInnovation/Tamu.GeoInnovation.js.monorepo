import { Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';

import { Season } from '@tamu-gisc/gisday/platform/data-api';

import { BaseService } from '../_base/base.service';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SeasonService extends BaseService<Season> {
  public resource: string;

  public activeSeason$: Observable<Season> = this.getActiveSeason().pipe(shareReplay());

  constructor(private env1: EnvironmentService, private http1: HttpClient) {
    super(env1, http1, 'seasons');
  }

  public getActiveSeason() {
    return this.http1.get<Season>(this.resource + '/active');
  }
}

