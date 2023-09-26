import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';

import { ActiveSeasonDto, Season } from '@tamu-gisc/gisday/platform/data-api';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { BaseService } from '../_base/base.service';

@Injectable({
  providedIn: 'root'
})
export class SeasonService extends BaseService<Season> {
  public activeSeason$: Observable<ActiveSeasonDto> = this.getActiveSeason().pipe(shareReplay());

  constructor(private env1: EnvironmentService, private http1: HttpClient) {
    super(env1, http1, 'seasons');
  }

  public getActiveSeason() {
    return this.http1.get<ActiveSeasonDto>(this.resource + '/active');
  }
}

