import { Injectable } from '@angular/core';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { IScenariosRequestPayload } from '@tamu-gisc/cpa/data-api';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ScenarioService {
  private resource: string;

  constructor(private http: HttpClient, private environment: EnvironmentService) {
    this.resource = this.environment.value(`api_url`) + 'scenarios';
  }

  public createScenario(scenario: IScenariosRequestPayload) {
    return this.http.post<IScenariosRequestPayload>(this.resource, scenario);
  }

  public getScenarios() {
    return this.http.get<IScenariosRequestPayload[]>(this.resource);
  }

  public getScenario(guid: string) {
    return this.http.get<IScenariosRequestPayload>(`${this.resource}/${guid}`);
  }

  public updateScenario(guid: string, scenario: IScenariosRequestPayload) {
    return this.http.patch(`${this.resource}/${guid}`, scenario);
  }
}
