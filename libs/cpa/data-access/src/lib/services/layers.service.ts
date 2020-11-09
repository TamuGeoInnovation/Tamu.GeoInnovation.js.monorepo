import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { Scenario } from '@tamu-gisc/cpa/common/entities';

@Injectable({
  providedIn: 'root'
})
export class LayersService {
  public resource: string;

  constructor(private environment: EnvironmentService, private http: HttpClient) {
    this.resource = this.environment.value(`api_url`) + 'layers';
  }

  public getAvailableLayersForWorkshop(workshopGuid: string) {
    return this.http.get<Array<Scenario>>(`${this.resource}/workshop/${workshopGuid}`);
  }

  public getWorkshopScenarioLayerSource(workshopGuid: string, scenarioGuid: string) {
    return this.http.get(`${this.resource}/${workshopGuid}/${scenarioGuid}`);
  }
}
