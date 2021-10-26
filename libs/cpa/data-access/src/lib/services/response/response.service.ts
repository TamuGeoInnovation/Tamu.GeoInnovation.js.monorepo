import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { IResponseDto, IResponseRequestDto, IResponseResolved } from '@tamu-gisc/cpa/data-api';

@Injectable({
  providedIn: 'root'
})
export class ResponseService {
  public resource: string;

  constructor(private environment: EnvironmentService, private http: HttpClient) {
    this.resource = this.environment.value(`api_url`) + 'responses';
  }

  public getResponsesForWorkshop(workshopGuid: string) {
    return this.http.get<IResponseResolved[]>(`${this.resource}/workshop/${workshopGuid}`);
  }

  public getResponsesForWorkshopAndSnapshot(workshopGuid: string, snapshotGuid: string) {
    return this.http.get<IResponseDto[]>(`${this.resource}/${workshopGuid}/${snapshotGuid}`);
  }

  public createResponse(response: IResponseRequestDto) {
    return this.http.post(this.resource, response);
  }

  public updateResponse(guid: string, response: IResponseRequestDto) {
    return this.http.patch(`${this.resource}/${guid}`, response);
  }
}
