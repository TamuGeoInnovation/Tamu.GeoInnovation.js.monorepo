import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { IScenarioSimplified, IScenarioPartial, IScenarioResolved } from '@tamu-gisc/cpa/data-api';

@Injectable({
  providedIn: 'root'
})
export class ScenarioService {
  private resource: string;

  constructor(private http: HttpClient, private environment: EnvironmentService) {
    this.resource = this.environment.value(`api_url`) + 'scenarios';
  }

  public create(scenario: IScenarioPartial) {
    return this.http.post<IScenarioSimplified>(this.resource, scenario);
  }

  public getAll() {
    return this.http.get<IScenarioSimplified[]>(this.resource);
  }

  public getOne(guid: string) {
    return this.http.get<IScenarioPartial>(`${this.resource}/${guid}`);
  }

  public getLayerForScenario(scenarioGuid: string) {
    return this.http.get<IScenarioResolved>(`${this.resource}/${scenarioGuid}/layer`);
  }

  public getForWorkshop(workshopGuid: string) {
    return this.http.get<Array<IScenarioResolved>>(`${this.resource}/workshop/${workshopGuid}`);
  }

  public update(guid: string, scenario: IScenarioPartial) {
    return this.http.patch(`${this.resource}/${guid}`, scenario);
  }

  public delete(guid: string) {
    return this.http.delete(`${this.resource}/${guid}`);
  }
}
