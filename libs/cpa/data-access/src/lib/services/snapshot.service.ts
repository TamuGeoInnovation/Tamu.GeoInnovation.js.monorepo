import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { ISnapshotsRequestPayload, ISnapshotsResponse } from '@tamu-gisc/cpa/data-api';

@Injectable({
  providedIn: 'root'
})
export class SnapshotService {
  private resource: string;

  constructor(private http: HttpClient, private environment: EnvironmentService) {
    this.resource = this.environment.value(`api_url`) + 'snapshots';
  }

  public create(snapshot: ISnapshotsRequestPayload) {
    return this.http.post<ISnapshotsResponse>(this.resource, snapshot);
  }

  public getAll() {
    return this.http.get<ISnapshotsResponse[]>(this.resource);
  }

  public getOne(guid: string) {
    return this.http.get<ISnapshotsResponse>(`${this.resource}/${guid}`);
  }

  public getForWorkshop(workshopGuid: string) {
    return this.http.get<Array<ISnapshotsResponse>>(`${this.resource}/workshop/${workshopGuid}`);
  }

  public update(guid: string, snapshot: ISnapshotsRequestPayload) {
    return this.http.patch(`${this.resource}/${guid}`, snapshot);
  }

  public delete(guid: string) {
    return this.http.delete(`${this.resource}/${guid}`);
  }
}
