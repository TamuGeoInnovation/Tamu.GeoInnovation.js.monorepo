import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { SiteCopyFile, SiteCopyPlan } from '@tamu-gisc/gisday/platform/data-api';

/** Copying a season from one GIS Day site to another (#2078). Both calls need a GIS Day admin. */
@Injectable({ providedIn: 'root' })
export class SiteCopyService {
  private readonly http = inject(HttpClient);
  private readonly resource = inject(EnvironmentService).value('api_url') + '/site-copy';

  /** The season and what its events bring, as a file another site can import. */
  public export(seasonGuid: string) {
    return this.http.get<SiteCopyFile>(`${this.resource}/export/${seasonGuid}`, {
      params: { source: window.location.origin }
    });
  }

  /** What importing the file would add and update; with `apply`, does it. */
  public import(file: SiteCopyFile, apply: boolean) {
    return this.http.post<SiteCopyPlan>(`${this.resource}/import`, file, { params: { apply: `${apply}` } });
  }
}
