import { Injectable } from '@angular/core';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { HttpClient } from '@angular/common/http';
import { IResponseResponse, IResponseRequestPayload } from '@tamu-gisc/cpa/data-api';

@Injectable({
  providedIn: 'root'
})
export class ResponseService {
  public resource: string;

  constructor(private environment: EnvironmentService, private http: HttpClient) {
    this.resource = this.environment.value(`api_url`) + 'responses';
  }

  public getResponses() {
    return this.http.get<IResponseResponse[]>(this.resource);
  }

  public getResponsesForWorkshopAndScenario(workshopGuid: string, scenarioGuid: string) {
    return this.http.get<IResponseResponse[]>(`${this.resource}/${workshopGuid}/${scenarioGuid}`);
  }

  public getResponse(guid: string) {
    return this.http.get<IResponseResponse>(`${this.resource}/${guid}`);
  }

  public createResponse(response: IResponseRequestPayload) {
    return this.http.post(this.resource, response);
  }

  public updateResponse(guid: string, response: IResponseRequestPayload) {
    return this.http.patch(`${this.resource}/${guid}`, response);
  }
}
