import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { ISnapshotPartial, ISnapshotResolved } from '@tamu-gisc/cpa/data-api';
import { Snapshot } from '@tamu-gisc/cpa/common/entities';

@Injectable({
  providedIn: 'root'
})
export class SnapshotService {
  private resource: string;

  constructor(private http: HttpClient, private environment: EnvironmentService) {
    this.resource = this.environment.value(`api_url`) + 'snapshots';
  }

  public create(snapshot: ISnapshotPartial) {
    return this.http.post<ISnapshotResolved>(this.resource, snapshot);
  }

  public createCopy(snapshotGuid: string) {
    return this.http.post<ISnapshotResolved>(`${this.resource}/copy`, { guid: snapshotGuid });
  }

  public getAll() {
    return this.http.get<ISnapshotResolved[]>(this.resource);
  }

  public getOne(guid: string) {
    return this.http.get<ISnapshotResolved>(`${this.resource}/${guid}`);
  }

  public getMany(where: { prop: keyof Snapshot; value: boolean | number | string }) {
    return this.http.post<ISnapshotResolved[]>(`${this.resource}/many`, {
      prop: where.prop,
      value: where.value
    });
  }

  public getForWorkshop(workshopGuid: string) {
    return this.http.get<Array<ISnapshotResolved>>(`${this.resource}/workshop/${workshopGuid}`);
  }

  public getContextsForWorkshop(workshopGuid: string) {
    return this.http.get<Array<ISnapshotResolved>>(`${this.resource}/context/workshop/${workshopGuid}`);
  }

  public update(guid: string, snapshot: ISnapshotPartial) {
    return this.http.patch(`${this.resource}/${guid}`, snapshot);
  }

  public delete(guid: string) {
    return this.http.delete(`${this.resource}/${guid}`);
  }
}
