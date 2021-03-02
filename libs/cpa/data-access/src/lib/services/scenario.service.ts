import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { Scenario } from '@tamu-gisc/cpa/common/entities';
import { IScenariosResponse, IScenariosResponseDetails, IScenariosResponseResolved } from '@tamu-gisc/cpa/data-api';

@Injectable({
  providedIn: 'root'
})
export class ScenarioService {
  private resource: string;

  constructor(private http: HttpClient, private environment: EnvironmentService) {
    this.resource = this.environment.value(`api_url`) + 'scenarios';
  }

  public create(scenario: Scenario) {
    return this.http.post<IScenariosResponse>(this.resource, scenario);
  }

  public getAll() {
    return this.http.get<IScenariosResponse[]>(this.resource);
  }

  public getOne(guid: string) {
    return this.http.get<IScenariosResponseDetails>(`${this.resource}/${guid}`);
  }

  public getForWorkshop(workshopGuid: string) {
    return this.http.get<Array<IScenariosResponseResolved>>(`${this.resource}/workshop/${workshopGuid}`);
  }

  public update(guid: string, scenario: Scenario) {
    return this.http.patch(`${this.resource}/${guid}`, scenario);
  }

  public delete(guid: string) {
    return this.http.delete(`${this.resource}/${guid}`);
  }

  public getLayerForScenario(guid: string) {
    return this.http.get<IScenariosResponseResolved>(`${this.resource}/${guid}/layer`);
  }
}
