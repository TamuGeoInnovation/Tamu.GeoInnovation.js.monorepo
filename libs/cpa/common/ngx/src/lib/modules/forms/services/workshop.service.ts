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

  public createWorkshop(workshop: IWorkshopRequestPayload) {
    return this.http.post(this.resource, { body: workshop });
  }

  public getWorkshops() {
    return this.http.get<IWorkshopRequestPayload[]>(this.resource);
  }

  public getWorkshop(guid: IWorkshopRequestPayload['guid']) {
    return this.http.get<IWorkshopRequestPayload>(`${this.resource}/${guid}`);
  }
}
