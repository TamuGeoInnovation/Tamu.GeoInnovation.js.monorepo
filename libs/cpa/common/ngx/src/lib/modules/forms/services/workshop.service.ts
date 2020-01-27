import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { IWorkshopRequestPayload } from '@tamu-gisc/cpa/data-api';

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

  public addScenario(wGuid: string, sGuid: string) {
    return this.http.post(`${this.resource}/scenario`, { workshopGuid: wGuid, scenarioGuid: sGuid });
  }

  public deleteScenario(wGuid: string, sGuid: string) {
    return this.http.delete(`${this.resource}/scenario/${wGuid}/${sGuid}`);
  }
}
