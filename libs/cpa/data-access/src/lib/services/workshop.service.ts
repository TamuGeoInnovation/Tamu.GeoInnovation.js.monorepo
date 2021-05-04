import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { IScenariosResponse, IWorkshopRequestPayload } from '@tamu-gisc/cpa/data-api';

@Injectable({
  providedIn: 'root'
})
export class WorkshopService {
  private resource: string;

  constructor(private environment: EnvironmentService, private http: HttpClient) {
    this.resource = this.environment.value('api_url') + 'workshops';
  }

  public getWorkshops() {
    return this.http.get<IWorkshopRequestPayload[]>(this.resource);
  }

  public createWorkshop(workshop: IWorkshopRequestPayload) {
    return this.http.post(this.resource, workshop);
  }

  public updateWorkshop(guid: string, workshop: IWorkshopRequestPayload) {
    return this.http.patch(`${this.resource}/${guid}`, workshop);
  }

  public getWorkshop(guid: IWorkshopRequestPayload['guid']) {
    return this.http.get<IWorkshopRequestPayload>(`${this.resource}/${guid}`);
  }

  public deleteWorkshop(guid: IWorkshopRequestPayload['guid']) {
    return this.http.delete(`${this.resource}/${guid}`);
  }

  public setSnapshots(wGuid: string, guids: Array<string>) {
    return this.http.post(`${this.resource}/snapshots`, { workshopGuid: wGuid, snapshotGuids: guids });
  }

  public addSnapshot(wGuid: string, sGuid: string) {
    return this.http.post(`${this.resource}/snapshot`, { workshopGuid: wGuid, snapshotGuid: sGuid });
  }

  public deleteSnapshot(wGuid: string, sGuid: string) {
    return this.http.delete(`${this.resource}/snapshot/${wGuid}/${sGuid}`);
  }

  public addScenario(wGuid: string, sGuid: string) {
    return this.http.post<IScenariosResponse>(`${this.resource}/scenario`, { workshopGuid: wGuid, scenarioGuid: sGuid });
  }

  public deleteScenario(wGuid: string, sGuid: string) {
    return this.http.delete(`${this.resource}/scenario/${wGuid}/${sGuid}`);
  }

  public addContextualSnapshot(wGuid: string, sGuid: string) {
    return this.http.post(`${this.resource}/context`, { workshopGuid: wGuid, snapshotGuid: sGuid });
  }

  public deleteContextualSnapshot(wGuid: string, sGuid: string) {
    return this.http.delete(`${this.resource}/context/${wGuid}/${sGuid}`);
  }
}
